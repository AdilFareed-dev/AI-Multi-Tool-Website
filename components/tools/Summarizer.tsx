import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Summarizer = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following text:\n\n${text}`,
      });
      setSummary(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to summarize: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Summarizer" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a long article, document, or essay here..."
            className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={10}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors w-full"
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !summary && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {summary && <p className="whitespace-pre-wrap">{summary}</p>}
            {!summary && !isLoading && <p className="text-gray-500 text-center">Your summary will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default Summarizer;
