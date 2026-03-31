
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const AIImageEditor = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        setEditedImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read the image file.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !originalImage) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: originalImage.base64, mimeType: originalImage.mimeType } },
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        setEditedImage(imageUrl);
      } else {
        throw new Error("No image was returned from the API.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to edit image: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="AI Image Editor" onBack={onBack}>
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                {originalImage ? (
                  <img src={originalImage.url} alt="Original" className="max-h-full max-w-full rounded" />
                ) : (
                  <div className="text-center text-gray-400">
                    <p>Upload an image to start editing</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg h-64">
                {isLoading && <LoadingSpinner size="w-12 h-12" />}
                {editedImage && !isLoading && (
                  <img src={editedImage} alt="Edited" className="max-h-full max-w-full rounded" />
                )}
                {!editedImage && !isLoading && (
                  <p className="text-gray-500 text-center">Your edited image will appear here.</p>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter"
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading || !originalImage}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim() || !originalImage}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Editing...' : 'Apply Edit'}
              </button>
            </form>
            {error && <p className="text-red-400 text-center">{error}</p>}
        </div>
    </ToolContainer>
  );
};

export default AIImageEditor;
