import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const ComplexProblemSolver = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
      setSolution(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to solve the problem: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Complex Problem Solver" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <div className="text-center p-2 bg-purple-900/50 rounded-lg text-purple-200">
            <p>Powered by Gemini 2.5 Pro with maximum "thinking" budget for deep analysis.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a complex problem, a challenging question, or a multi-step task..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={8}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors w-full"
          >
            {isLoading ? 'Analyzing...' : 'Generate Solution'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 mt-4">
            {isLoading && !solution && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
            {solution && <pre className="whitespace-pre-wrap font-sans">{solution}</pre>}
            {!solution && !isLoading && <p className="text-gray-500 text-center">The AI's solution will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default ComplexProblemSolver;
