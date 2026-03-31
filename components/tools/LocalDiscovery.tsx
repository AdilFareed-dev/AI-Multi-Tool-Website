import React, { useState, FormEvent, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LatLng {
  latitude: number;
  longitude: number;
}

const LocalDiscovery = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError(`Could not get your location: ${err.message}. Please enable location services.`);
      }
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !location) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: location }
          }
        },
      });

      setResult(response.text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        setSources(groundingChunks.filter(chunk => chunk.maps));
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to find places: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Local Discovery" onBack={onBack}>
      <div className="flex flex-col gap-6">
        {locationError && <p className="text-yellow-400 text-center bg-yellow-900/50 p-3 rounded-lg">{locationError}</p>}
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Good Italian restaurants nearby"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || !location}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || !location}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? <LoadingSpinner size="w-6 h-6" /> : 'Find'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        {result && (
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
              <h3 className="text-xl font-semibold">Result</h3>
              <p className="whitespace-pre-wrap">{result}</p>
              {sources.length > 0 && (
                  <div>
                      <h4 className="font-semibold mt-4 mb-2">Places:</h4>
                      <ul className="list-disc list-inside space-y-1">
                          {sources.map((source, index) => (
                              <li key={index}>
                                  <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                      {source.maps.title || 'View on Map'}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>
        )}
      </div>
    </ToolContainer>
  );
};

export default LocalDiscovery;
