import React from 'react';
import { Tool, ToolCategory, ToolId } from '../types';
import { TOOLS, CATEGORIES } from '../constants';

interface ToolGridProps {
  onSelectTool: (toolId: ToolId) => void;
}

// Fix: Refactored ToolCard to use a standard props interface and React.FC
// This resolves a TypeScript error where the 'key' prop was incorrectly
// considered part of the component's own props.
interface ToolCardProps {
  tool: Tool;
  onSelect: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => (
    <button
        onClick={onSelect}
        className="group relative flex flex-col justify-between p-5 bg-gray-800 rounded-lg h-36 text-left transition-all duration-300 hover:bg-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transform hover:-translate-y-1"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        <div className="relative z-10">
            <div className="mb-3 text-purple-400 group-hover:text-cyan-300 transition-colors duration-300">
                <tool.icon className="w-8 h-8"/>
            </div>
            <h3 className="font-bold text-lg text-gray-100">{tool.name}</h3>
        </div>
        <p className="relative z-10 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{tool.description}</p>
    </button>
);

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          AI Multi-Tool Suite
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          25 Powerful AI Tools at Your Fingertips. Powered by Gemini.
        </p>
      </header>

      <main className="space-y-12">
        {CATEGORIES.map((category) => (
          <section key={category}>
            <h2 className="text-2xl font-semibold mb-6 border-l-4 border-purple-500 pl-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {TOOLS.filter(tool => tool.category === category).map((tool) => (
                <ToolCard key={tool.id} tool={tool} onSelect={() => onSelectTool(tool.id)} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
