import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const formatOptions = ["Fix Grammar & Spelling", "Make it Shorter", "Make it Longer", "Make it More Professional", "Make it More Casual"];

const TextFormatter = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(formatOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formattedText, setFormattedText] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setFormattedText(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `${selectedFormat} for the following text:\n\n${text}`,
      });
      setFormattedText(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to format text: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Text Formatter" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={8}
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4">
             <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                {formatOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Formatting...' : 'Format Text'}
              </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !formattedText && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {formattedText && <p className="whitespace-pre-wrap">{formattedText}</p>}
            {!formattedText && !isLoading && <p className="text-gray-500 text-center">Your formatted text will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default TextFormatter;
