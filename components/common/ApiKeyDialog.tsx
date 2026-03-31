
import React from 'react';

interface ApiKeyDialogProps {
  onSelectKey: () => void;
  featureName: string;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onSelectKey, featureName }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-800 border border-purple-500 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">API Key Required for {featureName}</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        This advanced feature requires a personal API key. Please select your key to proceed.
        Video generation can take several minutes and may incur costs.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onSelectKey}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Select API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
        >
          Learn about Billing
        </a>
      </div>
    </div>
  );
};
