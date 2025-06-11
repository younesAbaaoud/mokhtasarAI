from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch
import logging
import psutil
import os
import time
import traceback

class SummarizationService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SummarizationService, cls).__new__(cls)
            logging.info("Created new SummarizationService instance")
        return cls._instance

    def __init__(self):
        if hasattr(self, 'model'):
            return

        try:
            start_time = time.time()
            logging.info("=" * 50)
            logging.info("Starting model initialization...")
            logging.info("=" * 50)

            self.model_name = "plguillou/t5-base-fr-sum-cnndm"  # Fine-tuned for summarization in French
            self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model_cache")

            process = psutil.Process(os.getpid())
            logging.info(f"Memory usage before loading: {process.memory_info().rss / 1024 / 1024:.2f} MB")

            tokenizer_start = time.time()
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, cache_dir=self.cache_dir)
            logging.info(f"Tokenizer loaded in {time.time() - tokenizer_start:.2f} seconds")

            model_start = time.time()
            self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name, cache_dir=self.cache_dir)
            logging.info(f"Model loaded in {time.time() - model_start:.2f} seconds")

            if torch.cuda.is_available():
                logging.info(f"CUDA available: {torch.cuda.get_device_name(0)}")
                logging.info(f"CUDA memory allocated: {torch.cuda.memory_allocated(0) / 1024 / 1024:.2f} MB")
                logging.info(f"CUDA memory cached: {torch.cuda.memory_reserved(0) / 1024 / 1024:.2f} MB")
            else:
                logging.info("Running on CPU")

            self.tokenizer.model_max_length = 1024

            logging.info(f"Memory usage after loading: {process.memory_info().rss / 1024 / 1024:.2f} MB")
            logging.info(f"Total initialization time: {time.time() - start_time:.2f} seconds")
            logging.info("=" * 50)
            logging.info("SummarizationService initialized successfully!")
            logging.info("=" * 50)

        except Exception as e:
            logging.error("=" * 50)
            logging.error(f"Error initializing SummarizationService: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            logging.error("=" * 50)
            raise

    def chunk_text_by_tokenization(self, text: str, max_tokens: int = 1024) -> list:
        try:
            if not text or not isinstance(text, str):
                logging.error(f"Invalid input text: {type(text)}")
                return []

            logging.info(f"Chunking text of length {len(text)} characters")
            token_ids = self.tokenizer.encode(text, add_special_tokens=False)
            if len(token_ids) <= max_tokens:
                return [text]

            chunks = []
            for start in range(0, len(token_ids), max_tokens):
                chunk_token_ids = token_ids[start: start + max_tokens]
                chunk = self.tokenizer.decode(chunk_token_ids, skip_special_tokens=True)
                chunks.append(chunk)

            logging.info(f"Text chunked into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logging.error(f"Error in chunk_text_by_tokenization: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise

    def clean_summary(self, summary: str) -> str:
        summary = summary.replace("  ", " ").replace(" .", ".").replace(" ,", ",")
        sentences = summary.split(". ")
        sentences = [s.capitalize() for s in sentences]
        return ". ".join(sentences)

    def generate_summary_for_chunk(self, chunk: str, num_beams: int = 6) -> str:
        try:
            if not chunk or not isinstance(chunk, str):
                logging.error(f"Invalid chunk input: {type(chunk)}")
                return ""

            start_time = time.time()
            logging.info(f"Generating summary for chunk of length {len(chunk)} characters")

            # Calculate dynamic summary length based on input length
            input_tokens = len(self.tokenizer.encode(chunk))
            min_summary_tokens = max(100, int(input_tokens * 0.3))  # At least 200 tokens or 30% of input
            max_summary_tokens = min(1000, int(input_tokens * 0.7))  # At most 1024 tokens or 70% of input
            
            logging.info(f"Input tokens: {input_tokens}, Summary length range: {min_summary_tokens}-{max_summary_tokens} tokens")

            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(device)

            inputs = self.tokenizer(
                chunk,
                return_tensors="pt",
                truncation=True,
                max_length=self.tokenizer.model_max_length,
                padding=True
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}

            summary_ids = self.model.generate(
                inputs["input_ids"],
                num_beams=num_beams,
                no_repeat_ngram_size=3,
                early_stopping=True,
                pad_token_id=self.tokenizer.pad_token_id,
                length_penalty=1.0,
                min_length=min_summary_tokens,
                max_length=max_summary_tokens,
                do_sample=False
            )

            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            summary = self.clean_summary(summary)

            logging.info(f"Summary generated in {time.time() - start_time:.2f} seconds")
            logging.info(f"Summary length: {len(summary)} characters")
            return summary
        except Exception as e:
            logging.error(f"Error in generate_summary_for_chunk: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise

    def summarize_text(self, text: str) -> str:
        try:
            if not text or not isinstance(text, str):
                logging.error(f"Invalid input text: {type(text)}")
                return ""

            start_time = time.time()
            logging.info("=" * 50)
            logging.info("Starting text summarization process")
            logging.info(f"Input text length: {len(text)} characters")

            if len(text.split()) < 2000:
                logging.info("Text is short enough to summarize directly")
                return self.generate_summary_for_chunk(text, num_beams=6)

            chunks = self.chunk_text_by_tokenization(text, max_tokens=1024)
            if not chunks:
                logging.error("No valid chunks generated from input text")
                return ""

            chunk_summaries = []
            for i, chunk in enumerate(chunks, 1):
                logging.info(f"Processing chunk {i}/{len(chunks)}")
                summary = self.generate_summary_for_chunk(chunk, num_beams=6)
                if summary:
                    chunk_summaries.append(summary)

            if not chunk_summaries:
                logging.error("No valid summaries generated from chunks")
                return ""

            combined_summary_text = " ".join(chunk_summaries)
            logging.info("Generating final summary from combined chunks")

            final_summary = self.generate_summary_for_chunk(combined_summary_text, num_beams=6)

            logging.info(f"Summarization completed in {time.time() - start_time:.2f} seconds")
            logging.info(f"Final summary length: {len(final_summary)} characters")
            logging.info("=" * 50)

            return final_summary
        except Exception as e:
            logging.error(f"Error in summarization: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise Exception(f"Error in summarization: {str(e)}")

summarization_service = SummarizationService()
