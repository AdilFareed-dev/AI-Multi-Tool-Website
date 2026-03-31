import React, { useState, ChangeEvent } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { fileToBase64 } from '../../utils/fileUtils';

const ColorPaletteGenerator = ({ onBack }: { onBack: () => void }) => {
  const [image, setImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setPalette([]);
      try {
        const base64 = await fileToBase64(file);
        setImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        await generatePalette({ base64, mimeType: file.type });
      } catch (err) {
        setError("Failed to process the image file.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generatePalette = async (img: { base64: string, mimeType: string }) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: img.base64, mimeType: img.mimeType } },
            { text: "Extract the 6 most prominent colors from this image." },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING, description: "Hex color code" },
                    name: { type: Type.STRING, description: "Name of the color" },
                  }
                }
              }
            }
          },
        },
      });

      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr);
      setPalette(parsed.colors.map((c: any) => c.hex) || []);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate palette: ${errorMessage}`);
    }
  };

  return (
    <ToolContainer title="Color Palette Generator" onBack={onBack}>
        <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md h-64 flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
              {image ? (
                <img src={image.url} alt="For palette generation" className="max-h-full max-w-full rounded" />
              ) : (
                <p className="text-center text-gray-400">Upload an image to extract its colors</p>
              )}
            </div>

            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {isLoading && <LoadingSpinner />}
            {palette.length > 0 && !isLoading && (
              <div className="flex flex-wrap justify-center gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-lg shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    <p className="mt-2 text-sm font-mono tracking-wider">{color}</p>
                  </div>
                ))}
              </div>
            )}
        </div>
    </ToolContainer>
  );
};

export default ColorPaletteGenerator;
