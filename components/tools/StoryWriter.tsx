import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const StoryWriter = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const fullPrompt = `Write a short story based on this prompt: ${prompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      setStory(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to write story: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Story Writer" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A detective who solves crimes with the help of a talking cat..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors w-full"
          >
            {isLoading ? 'Writing...' : 'Write Story'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !story && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {story && <p className="whitespace-pre-wrap">{story}</p>}
            {!story && !isLoading && <p className="text-gray-500 text-center">Your generated story will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default StoryWriter;
