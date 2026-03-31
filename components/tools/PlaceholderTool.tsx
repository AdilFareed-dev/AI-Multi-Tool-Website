
import React from 'react';
import { ToolContainer } from '../common/ToolContainer';

interface PlaceholderToolProps {
  onBack: () => void;
  toolName: string;
}

export const PlaceholderTool: React.FC<PlaceholderToolProps> = ({ onBack, toolName }) => {
  return (
    <ToolContainer title={toolName} onBack={onBack}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-gray-400">Coming Soon!</h2>
        <p className="text-gray-500 mt-2">The "{toolName}" tool is under construction.</p>
      </div>
    </ToolContainer>
  );
};
