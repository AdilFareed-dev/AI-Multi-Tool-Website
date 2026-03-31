import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

const NUM_FRAMES = 5;

const extractFrames = (videoFile: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;

      let processedFrames = 0;
      for (let i = 0; i < NUM_FRAMES; i++) {
        const time = (duration / (NUM_FRAMES + 1)) * (i + 1);
        video.currentTime = time;
      }

      video.onseeked = () => {
        if (processedFrames < NUM_FRAMES && context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
          frames.push(base64);
          processedFrames++;
          if (processedFrames === NUM_FRAMES) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
          }
        }
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject('Error processing video file.');
      };
    };
    video.onerror = (e) => reject('Error loading video file.');
  });
};


const VideoAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        setAnalysis(null);
        setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !file) return;

    setIsLoading(true);
    setLoadingText('Extracting frames from video...');
    setError(null);
    setAnalysis(null);

    try {
      const frames = await extractFrames(file);
      setLoadingText('Analyzing frames with AI...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const imageParts = frames.map(frame => ({
        inlineData: { data: frame, mimeType: 'image/jpeg' }
      }));
      
      const fullPrompt = `These are ${NUM_FRAMES} sequential frames from a video. Analyze them to answer the following question: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [...imageParts, { text: fullPrompt }] },
      });
      setAnalysis(response.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to analyze video: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  return (
    <ToolContainer title="Video Analyzer" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <div className="flex-grow bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-full text-center">
                  <LoadingSpinner />
                  <p className="mt-4">{loadingText}</p>
              </div>
            )}
            {analysis && <p className="whitespace-pre-wrap">{analysis}</p>}
            {!analysis && !isLoading && <p className="text-gray-500 text-center">Video analysis will appear here.</p>}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should I look for in the video?"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || !file}
          />
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            className="text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-purple-300 hover:file:bg-gray-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || !file}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </div>
    </ToolContainer>
  );
};

export default VideoAnalyzer;
