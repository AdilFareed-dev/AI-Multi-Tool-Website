import React, { useState, FormEvent, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { decode, decodeAudioData } from '../../utils/audioUtils';

const voices = ["Kore", "Puck", "Zephyr", "Charon", "Fenrir"];

const TextToSpeech = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(voices[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playAudio = async (base64Audio: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await playAudio(base64Audio);
      } else {
        throw new Error("No audio data received.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate speech: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Text to Speech" onBack={onBack}>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to be spoken..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={6}
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            >
              {voices.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
            >
              {isLoading ? <LoadingSpinner size="w-6 h-6" /> : 'Speak'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </ToolContainer>
  );
};

export default TextToSpeech;
