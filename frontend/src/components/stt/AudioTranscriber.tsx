import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TranscriptionResult {
  transcription: string;
  processing_time: number;
}

export default function AudioTranscriber() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [progress, setProgress] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please select an audio file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
      setProgress('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setProgress('Processing audio file... This may take several minutes for longer files.');

    try {
      const formData = new FormData();
      formData.append('audio_file', file);

      const response = await fetch('http://localhost:8000/stt/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setResult(data);
      setProgress(`Transcription completed in ${data.processing_time.toFixed(2)} seconds`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Audio Transcription</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Audio File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/90"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Supported formats: MP3, WAV, M4A, etc.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {progress && (
          <div className="text-blue-500 text-sm">{progress}</div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full ${
            !file || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
        </Button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Transcription Result</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result.transcription}</p>
            <p className="text-sm text-gray-500 mt-2">
              Processing time: {result.processing_time.toFixed(2)} seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 