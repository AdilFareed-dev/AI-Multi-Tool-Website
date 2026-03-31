import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const ResumeHelper = ({ onBack }: { onBack: () => void }) => {
  const [resumeText, setResumeText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const fullPrompt = `Here is my resume:\n\n${resumeText}\n\nPlease help me with the following task: ${prompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
      });
      setFeedback(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get feedback: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Resume Helper" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-grow">
          <div className="flex flex-col md:flex-row gap-4 flex-grow">
            <div className="flex flex-col gap-2 md:w-1/2">
                <label htmlFor="resume-text">Paste Your Resume:</label>
                <textarea
                    id="resume-text"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your full resume here."
                    className="w-full h-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                />
            </div>
            <div className="flex flex-col gap-2 md:w-1/2">
                <label htmlFor="feedback-text">Feedback:</label>
                <div id="feedback-text" className="w-full h-full bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {feedback && <p className="whitespace-pre-wrap">{feedback}</p>}
                    {!feedback && !isLoading && <p className="text-gray-500">Your feedback will appear here.</p>}
                </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make my summary more impactful for a tech role"
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !resumeText.trim() || !prompt.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Get Feedback'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </div>
    </ToolContainer>
  );
};

export default ResumeHelper;
