import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const ImageAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        setAnalysis(null);
        setError(null);
      } catch (err) {
        setError("Failed to read the image file.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !image) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: prompt },
          ],
        },
      });
      setAnalysis(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to analyze image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Image Analyzer" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
            {image ? (
              <img src={image.url} alt="To be analyzed" className="max-h-full max-w-full rounded" />
            ) : (
              <p className="text-center text-gray-400">Upload an image to analyze</p>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
            {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {analysis && <p className="whitespace-pre-wrap">{analysis}</p>}
            {!analysis && !isLoading && <p className="text-gray-500">Analysis will appear here.</p>}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to know about the image?"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || !image}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || !image}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </div>
    </ToolContainer>
  );
};

export default ImageAnalyzer;
