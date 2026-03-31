
import React, { useState, useMemo } from 'react';
import { ToolId } from './types';
import { TOOLS } from './constants';
import { ToolGrid } from './components/ToolGrid';

const App = () => {
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);

  const handleSelectTool = (toolId: ToolId) => {
    setSelectedToolId(toolId);
  };

  const handleBack = () => {
    setSelectedToolId(null);
  };

  const ActiveToolComponent = useMemo(() => {
    if (!selectedToolId) return null;
    const tool = TOOLS.find(t => t.id === selectedToolId);
    return tool ? tool.component : null;
  }, [selectedToolId]);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="h-screen flex flex-col">
          {ActiveToolComponent ? (
            <ActiveToolComponent onBack={handleBack} />
          ) : (
            <div className="overflow-y-auto">
              <ToolGrid onSelectTool={handleSelectTool} />
            </div>
          )}
      </main>
    </div>
  );
};

export default App;
