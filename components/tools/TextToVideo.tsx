import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { GoogleGenAI, Operation } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ApiKeyDialog } from '../common/ApiKeyDialog';

// Fix: Removed duplicate global declaration. It is now centralized in `types.ts`.

const aspectRatios = ["16:9", "9:16"];
const resolutions = ["720p", "1080p"];

const VEO_LOADING_MESSAGES = [
    "Warming up the digital director's chair...",
    "Assembling pixels into cinematic magic...",
    "Teaching virtual actors their lines...",
    "Scouting digital locations...",
    "Rendering the first few frames...",
    "This can take a few minutes, please wait...",
    "Applying special effects and color grading...",
    "Finalizing the soundtrack...",
];

const TextToVideo = ({ onBack }: { onBack: () => void }) => {
    const [prompt, setPrompt] = useState('');
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
        } else {
            // Fallback for environments where aistudio is not available
            setError("API key management is not available in this environment.");
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume selection is successful to avoid race conditions
            setApiKeySelected(true);
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
        if (!prompt.trim() || !apiKeySelected) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(VEO_LOADING_MESSAGES[0]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
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
            console.error(e);
        }
    };

    if (!apiKeySelected) {
        return (
            <ToolContainer title="Text to Video" onBack={onBack}>
                <ApiKeyDialog onSelectKey={handleSelectKey} featureName="Veo Video Generation" />
            </ToolContainer>
        );
    }

    return (
        <ToolContainer title="Text to Video" onBack={onBack}>
            <div className="flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar} (landscape)</option>)}
                        </select>
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            {resolutions.map(res => <option key={res} value={res}>{res}</option>)}
                        </select>
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="flex-grow bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
                        >
                            {isLoading ? 'Generating...' : 'Generate Video'}
                        </button>
                    </div>
                </form>

                {error && <p className="text-red-400 text-center">{error}</p>}

                <div className="w-full flex justify-center items-center mt-4 min-h-[300px] bg-gray-900/50 rounded-lg p-4">
                    {isLoading && (
                        <div className="text-center">
                            <LoadingSpinner size="w-16 h-16" />
                            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
                        </div>
                    )}
                    {videoUrl && !isLoading && (
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[500px] rounded-lg shadow-lg" />
                    )}
                    {!videoUrl && !isLoading && (
                        <p className="text-gray-500">Your generated video will appear here.</p>
                    )}
                </div>
            </div>
        </ToolContainer>
    );
};

export default TextToVideo;
