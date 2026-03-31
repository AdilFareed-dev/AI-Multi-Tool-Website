import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const BackgroundRemover = ({ onBack }: { onBack: () => void }) => {
  const [image, setImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        setResultImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read the image file.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: "Remove the background from this image. Make the new background transparent." },
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
        setResultImage(imageUrl);
      } else {
        throw new Error("No image was returned from the API.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to remove background: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Background Remover" onBack={onBack}>
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                {image ? (
                  <img src={image.url} alt="Original" className="max-h-full max-w-full rounded" />
                ) : (
                  <p className="text-center text-gray-400">Upload an image</p>
                )}
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg h-64">
                {isLoading && <LoadingSpinner size="w-12 h-12" />}
                {resultImage && !isLoading && (
                  <img src={resultImage} alt="Background removed" className="max-h-full max-w-full rounded" />
                )}
                {!resultImage && !isLoading && (
                  <p className="text-gray-500 text-center">Result will appear here.</p>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
              <button
                type="submit"
                disabled={isLoading || !image}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Removing...' : 'Remove Background'}
              </button>
            </form>
            {error && <p className="text-red-400 text-center">{error}</p>}
        </div>
    </ToolContainer>
  );
};

export default BackgroundRemover;
