import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const CodeGenerator = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('Python');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setCode(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const fullPrompt = `Generate a code snippet in ${language} for the following task: ${prompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
      });
      setCode(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate code: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Code Generator" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A function to reverse a string"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            rows={4}
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4">
             <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Language (e.g., Python, Javascript)"
                className="bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="flex-grow bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Code'}
              </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900 rounded-lg mt-4">
            {isLoading && !code && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {code && <pre className="p-4 text-sm whitespace-pre-wrap text-gray-200">{code}</pre>}
            {!code && !isLoading && <p className="text-gray-500 text-center p-4">Your generated code will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default CodeGenerator;
