import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const tones = ["Professional", "Casual", "Friendly", "Formal", "Direct"];

const EmailWriter = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState(tones[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setEmail(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const fullPrompt = `Write a ${tone} email about the following topic: ${prompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: fullPrompt,
      });
      setEmail(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to write email: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Email Writer" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should the email be about?"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4">
             <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Drafting...' : 'Draft Email'}
              </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !email && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {email && <pre className="whitespace-pre-wrap font-sans">{email}</pre>}
            {!email && !isLoading && <p className="text-gray-500 text-center">Your drafted email will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default EmailWriter;
