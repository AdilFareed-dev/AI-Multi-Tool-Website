import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Proofreader = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setCorrectedText(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `Proofread and correct the following text for grammar and spelling errors:\n\n${text}`,
      });
      setCorrectedText(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to proofread: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Proofreader" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <div className="w-full h-full bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
              {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
              {correctedText && <p className="whitespace-pre-wrap">{correctedText}</p>}
              {!correctedText && !isLoading && <p className="text-gray-500">Corrected text will appear here.</p>}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors w-full"
          >
            {isLoading ? 'Checking...' : 'Proofread'}
          </button>
        </form>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </div>
    </ToolContainer>
  );
};

export default Proofreader;
