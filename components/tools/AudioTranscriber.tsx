import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const AudioTranscriber = ({ onBack }: { onBack: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTranscription(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setTranscription(null);

    try {
      const base64Audio = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType: file.type } },
            { text: "Transcribe this audio." },
          ],
        },
      });
      setTranscription(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to transcribe audio: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Audio Transcriber" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange} 
            className="flex-grow text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !file}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !transcription && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {transcription && <p className="whitespace-pre-wrap">{transcription}</p>}
            {!transcription && !isLoading && <p className="text-gray-500 text-center">Your audio transcription will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default AudioTranscriber;
