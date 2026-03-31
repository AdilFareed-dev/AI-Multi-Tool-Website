import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const MemeGenerator = ({ onBack }: { onBack: () => void }) => {
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        setMemeImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read the image file.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !image) return;

    setIsLoading(true);
    setError(null);
    setMemeImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // Step 1: Generate a caption
      const captionResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: `Suggest a short, funny meme caption for this image about "${topic}". Respond with only the caption text.` },
          ],
        },
      });
      const caption = captionResponse.text.trim().replace(/"/g, ''); // Clean up quotes

      // Step 2: Generate the meme image with the caption
      const memeResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: `Add the text "${caption}" to this image in a classic meme format (impact font, white text, black outline).` },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = memeResponse.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        setMemeImage(imageUrl);
      } else {
        throw new Error("No image was returned from the API.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate meme: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Meme Generator" onBack={onBack}>
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                {image ? (
                  <img src={image.url} alt="Meme template" className="max-h-full max-w-full rounded" />
                ) : (
                  <div className="text-center text-gray-400">
                    <p>Upload an image for your meme</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg h-64">
                {isLoading && <LoadingSpinner size="w-12 h-12" />}
                {memeImage && !isLoading && (
                  <img src={memeImage} alt="Generated Meme" className="max-h-full max-w-full rounded" />
                )}
                {!memeImage && !isLoading && (
                  <p className="text-gray-500 text-center">Your generated meme will appear here.</p>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Meme topic, e.g., Monday mornings"
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading || !image}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim() || !image}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Meme'}
              </button>
            </form>
            {error && <p className="text-red-400 text-center">{error}</p>}
        </div>
    </ToolContainer>
  );
};

export default MemeGenerator;
