
import React, { ReactNode } from 'react';

interface ToolContainerProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

export const ToolContainer: React.FC<ToolContainerProps> = ({ title, onBack, children }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-full">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{title}</h1>
      </div>
      <div className="flex-grow bg-gray-800 rounded-lg p-6 shadow-lg overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
