import React, { useState, FormEvent, useEffect, useCallback, ChangeEvent } from 'react';
import { GoogleGenAI, Operation } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ApiKeyDialog } from '../common/ApiKeyDialog';
import { fileToBase64 } from '../../utils/fileUtils';

// Fix: Removed duplicate global declaration. It is now centralized in `types.ts`.

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1080p"];

const VEO_LOADING_MESSAGES = [
    "Animating your image...",
    "Breathing life into pixels...",
    "This can take a few minutes, hang tight!",
    "Choreographing pixel movements...",
    "Rendering the motion picture...",
];

const VideoFromImage = ({ onBack }: { onBack: () => void }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [resolution, setResolution] = useState('720p');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };
    
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const base64 = await fileToBase64(file);
          setImage({ base64, mimeType: file.type, url: URL.createObjectURL(file) });
        } catch (err) {
          setError("Failed to read the image file.");
        }
      }
    };

    const pollOperation = useCallback(async (operation: Operation) => {
        let currentOperation = operation;
        let messageIndex = 0;

        const intervalId = setInterval(() => {
            setLoadingMessage(VEO_LOADING_MESSAGES[messageIndex % VEO_LOADING_MESSAGES.length]);
            messageIndex++;
        }, 5000);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            while (!currentOperation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
            }

            if (currentOperation.response?.generatedVideos?.[0]?.video?.uri) {
                const downloadLink = currentOperation.response.generatedVideos[0].video.uri;
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                setVideoUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("Video generation completed but no video URI was found.");
            }
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
        }
    }, []);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!image || !apiKeySelected) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(VEO_LOADING_MESSAGES[0]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                image: {
                  imageBytes: image.base64,
                  mimeType: image.mimeType
                },
                config: {
                    numberOfVideos: 1,
                    resolution: resolution as '720p' | '1080p',
                    aspectRatio: aspectRatio as '16:9' | '9:16',
                }
            });
            await pollOperation(operation);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate video: ${errorMessage}`);
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("API Key validation failed. Please select your key again.");
                setApiKeySelected(false);
            }
            setIsLoading(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <ToolContainer title="Video from Image" onBack={onBack}>
                <ApiKeyDialog onSelectKey={handleSelectKey} featureName="Veo Video Generation" />
            </ToolContainer>
        );
    }

    return (
        <ToolContainer title="Video from Image" onBack={onBack}>
            <div className="flex flex-col gap-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                   <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                    {image ? (
                      <img src={image.url} alt="Uploaded" className="max-h-full max-w-full rounded" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <p>Upload an image to animate</p>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                      </div>
                    )}
                   </div>
                   <div className="w-full flex justify-center items-center bg-gray-900/50 rounded-lg p-4 h-64">
                    {isLoading && (
                        <div className="text-center">
                            <LoadingSpinner size="w-12 h-12" />
                            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
                        </div>
                    )}
                    {videoUrl && !isLoading && (
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-lg" />
                    )}
                    {!videoUrl && !isLoading && (
                        <p className="text-gray-500 text-center">Your generated video will appear here.</p>
                    )}
                    </div>
                 </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the motion (optional)"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isLoading}
                    />
                    <div className="flex flex-wrap gap-4">
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-3" disabled={isLoading}>
                            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                        <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-3" disabled={isLoading}>
                            {resolutions.map(res => <option key={res} value={res}>{res}</option>)}
                        </select>
                        <button type="submit" disabled={isLoading || !image} className="flex-grow bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500">
                            {isLoading ? 'Generating...' : 'Generate Video'}
                        </button>
                    </div>
                </form>

                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>
        </ToolContainer>
    );
};

export default VideoFromImage;
