
import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const ImageGenerator = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      setGeneratedImage(imageUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Image Generator" onBack={onBack}>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A robot holding a red skateboard"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          >
            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
          </select>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="w-full flex justify-center items-center mt-4 min-h-[300px] bg-gray-900/50 rounded-lg p-4">
          {isLoading && <LoadingSpinner size="w-16 h-16" />}
          {generatedImage && !isLoading && (
            <img src={generatedImage} alt="Generated" className="max-w-full max-h-[500px] rounded-lg shadow-lg" />
          )}
          {!generatedImage && !isLoading && (
             <p className="text-gray-500">Your generated image will appear here.</p>
          )}
        </div>
      </div>
    </ToolContainer>
  );
};

export default ImageGenerator;
