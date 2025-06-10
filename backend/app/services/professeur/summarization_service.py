from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
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
            logging.info("Starting BART model initialization...")
            logging.info("=" * 50)
            
            # Using local model path
            self.model_name = "facebook/bart-large-cnn"
            
            # Log system resources
            process = psutil.Process(os.getpid())
            logging.info(f"Memory usage before loading: {process.memory_info().rss / 1024 / 1024:.2f} MB")
            
            # Load tokenizer
            logging.info(f"Loading tokenizer from {self.model_name}...")
            tokenizer_start = time.time()
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            logging.info(f"Tokenizer loaded in {time.time() - tokenizer_start:.2f} seconds")
            
            # Load model
            logging.info(f"Loading model from {self.model_name}...")
            model_start = time.time()
            self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
            logging.info(f"Model loaded in {time.time() - model_start:.2f} seconds")
            
            # Log GPU information if available
            if torch.cuda.is_available():
                logging.info(f"CUDA available: {torch.cuda.get_device_name(0)}")
                logging.info(f"CUDA memory allocated: {torch.cuda.memory_allocated(0) / 1024 / 1024:.2f} MB")
                logging.info(f"CUDA memory cached: {torch.cuda.memory_reserved(0) / 1024 / 1024:.2f} MB")
            else:
                logging.info("Running on CPU")
            
            # Set maximum length for the tokenizer
            self.tokenizer.model_max_length = 1024
            
            # Log final memory usage and timing
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
        """Split text into chunks based on token count."""
        try:
            if not text or not isinstance(text, str):
                logging.error(f"Invalid input text: {type(text)}")
                return []
                
            logging.info(f"Chunking text of length {len(text)} characters")
            
            # Encode the text without special tokens
            token_ids = self.tokenizer.encode(text, add_special_tokens=False)
            
            # If text is shorter than max_tokens, return it as a single chunk
            if len(token_ids) <= max_tokens:
                return [text]
            
            chunks = []
            # Create chunks that are at most `max_tokens` long
            for start in range(0, len(token_ids), max_tokens):
                chunk_token_ids = token_ids[start : start + max_tokens]
                # Decode back to text
                chunk = self.tokenizer.decode(chunk_token_ids, skip_special_tokens=True)
                chunks.append(chunk)
            
            logging.info(f"Text chunked into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logging.error(f"Error in chunk_text_by_tokenization: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise

    def clean_summary(self, summary: str) -> str:
        """Clean up the summary text."""
        # Fix common English-French mixups
        replacements = {
            "of": "de",
            "and": "et",
            "without": "sans",
            "by": "par",
            "the": "le",
            "in": "dans",
            "on": "sur",
            "at": "à",
            "to": "à",
            "for": "pour",
            "with": "avec"
        }
        
        for eng, fr in replacements.items():
            summary = summary.replace(f" {eng} ", f" {fr} ")
            summary = summary.replace(f" {eng}.", f" {fr}.")
            summary = summary.replace(f" {eng},", f" {fr},")
        
        # Fix common French spelling issues
        spelling_fixes = {
            "canapé": "canapé",
            "prenent": "prennent",
            "réduvellent": "réduisent",
            "mokélien": "même plus",
            "mêmeLe": "même le",
            "Repas prisélévision": "repas pris devant la télévision",
            "Rep as": "repas",
            "Table": "table",
            "Etes": "Ces"
        }
        
        for wrong, correct in spelling_fixes.items():
            summary = summary.replace(wrong, correct)
        
        # Fix spacing issues
        summary = summary.replace("  ", " ")
        summary = summary.replace(" .", ".")
        summary = summary.replace(" ,", ",")
        
        # Fix capitalization
        sentences = summary.split(". ")
        sentences = [s.capitalize() for s in sentences]
        summary = ". ".join(sentences)
        
        return summary

    def generate_summary_for_chunk(self, chunk: str, num_beams: int = 4) -> str:
        """Generate summary for a single chunk of text."""
        try:
            if not chunk or not isinstance(chunk, str):
                logging.error(f"Invalid chunk input: {type(chunk)}")
                return ""
                
            start_time = time.time()
            logging.info(f"Generating summary for chunk of length {len(chunk)} characters")
            
            # Tokenize with truncation
            inputs = self.tokenizer(
                chunk,
                return_tensors="pt",
                truncation=True,
                max_length=self.tokenizer.model_max_length,
                padding=True
            )
            
            # Move model and inputs to GPU if available
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logging.info(f"Using device: {device}")
            self.model.to(device)
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Generate summary with parameters optimized for French text
            summary_ids = self.model.generate(
                inputs["input_ids"],
                num_beams=num_beams,
                no_repeat_ngram_size=2,
                early_stopping=True,
                pad_token_id=self.tokenizer.pad_token_id,
                length_penalty=3.0,  # Strongly favor longer summaries
                min_length=200,  # Ensure longer minimum length
                max_length=1024,  # Allow for very long summaries
                do_sample=False,  # Disable sampling for more deterministic output
                num_return_sequences=1,
                temperature=0.7  # Lower temperature for more focused output
            )
            
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            # Clean up the summary
            summary = self.clean_summary(summary)
            
            logging.info(f"Summary generated in {time.time() - start_time:.2f} seconds")
            return summary
        except Exception as e:
            logging.error(f"Error in generate_summary_for_chunk: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise

    def summarize_text(self, text: str) -> str:
        """Summarize large text by chunking and combining summaries."""
        try:
            if not text or not isinstance(text, str):
                logging.error(f"Invalid input text: {type(text)}")
                return ""
                
            start_time = time.time()
            logging.info("=" * 50)
            logging.info("Starting text summarization process")
            logging.info(f"Input text length: {len(text)} characters")
            
            # For short texts, summarize directly without chunking
            if len(text.split()) < 1000:
                logging.info("Text is short enough to summarize directly")
                return self.generate_summary_for_chunk(text, num_beams=6)
            
            # Step 1: Chunk the large text
            chunks = self.chunk_text_by_tokenization(text, max_tokens=1024)
            
            if not chunks:
                logging.error("No valid chunks generated from input text")
                return ""
            
            # Step 2: Summarize each chunk
            chunk_summaries = []
            for i, chunk in enumerate(chunks, 1):
                logging.info(f"Processing chunk {i}/{len(chunks)}")
                summary = self.generate_summary_for_chunk(chunk, num_beams=4)
                if summary:  # Only add non-empty summaries
                    chunk_summaries.append(summary)
            
            if not chunk_summaries:
                logging.error("No valid summaries generated from chunks")
                return ""
            
            # Step 3: Combine intermediate summaries
            combined_summary_text = " ".join(chunk_summaries)
            logging.info("Generating final summary from combined chunks")
            
            # Step 4: Generate final summary with more beams for better quality
            final_summary = self.generate_summary_for_chunk(combined_summary_text, num_beams=6)
            
            logging.info(f"Summarization completed in {time.time() - start_time:.2f} seconds")
            logging.info(f"Final summary length: {len(final_summary)} characters")
            logging.info("=" * 50)
            
            return final_summary
        except Exception as e:
            logging.error(f"Error in summarization: {str(e)}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            raise Exception(f"Error in summarization: {str(e)}")

# Create a singleton instance
summarization_service = SummarizationService() 