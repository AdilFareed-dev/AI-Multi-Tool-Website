
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { MicIcon, HeadphonesIcon } from '../icons';
import { encode, decode, decodeAudioData } from '../../utils/audioUtils';

type ConversationState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const LiveConversation = ({ onBack }: { onBack: () => void }) => {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [transcripts, setTranscripts] = useState<{ user: string, model: string }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversation = useCallback(async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
    }

    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
     if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    sessionPromiseRef.current = null;
    setConversationState('idle');
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  const startConversation = async () => {
    if (conversationState !== 'idle') return;
    setConversationState('connecting');
    setError(null);
    setTranscripts([]);
    setCurrentInput('');
    setCurrentOutput('');

    try {
      if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
          outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      nextStartTimeRef.current = 0;
      audioSourcesRef.current.clear();
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
              try {
                  streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                  audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                  mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                  scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                  
                  scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob: Blob = {
                          data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                          mimeType: 'audio/pcm;rate=16000',
                      };
                      if(sessionPromiseRef.current){
                        sessionPromiseRef.current.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                      }
                  };
                  mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                  scriptProcessorRef.current.connect(audioContextRef.current.destination);
                  setConversationState('listening');
              } catch (e) {
                   setError('Microphone access denied or failed.');
                   setConversationState('error');
              }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
                setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
                setTranscripts(prev => [...prev, {user: currentInput, model: currentOutput}]);
                setCurrentInput('');
                setCurrentOutput('');
            }
            if(message.serverContent?.interrupted){
                audioSourcesRef.current.forEach(source => source.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
                setConversationState('speaking');
                const outputCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if(audioSourcesRef.current.size === 0) {
                        setConversationState('listening');
                    }
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(`Connection error: ${e.message}`);
            setConversationState('error');
            stopConversation();
          },
          onclose: (e: CloseEvent) => {
            stopConversation();
          },
        },
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to start session: ${errorMessage}`);
      setConversationState('error');
    }
  };

  const getStateIndicator = () => {
    switch (conversationState) {
      case 'idle': return { text: 'Click start to talk', color: 'bg-gray-500' };
      case 'connecting': return { text: 'Connecting...', color: 'bg-yellow-500 animate-pulse' };
      case 'listening': return { text: 'Listening...', color: 'bg-green-500' };
      case 'speaking': return { text: 'Speaking...', color: 'bg-blue-500 animate-pulse' };
      case 'error': return { text: 'Error', color: 'bg-red-500' };
    }
  };

  const { text, color } = getStateIndicator();

  return (
    <ToolContainer title="Live Conversation" onBack={onBack}>
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={conversationState === 'idle' || conversationState === 'error' ? startConversation : stopConversation}
            className="px-6 py-3 rounded-lg text-white font-bold transition-colors w-40 text-center bg-purple-600 hover:bg-purple-700"
          >
            {conversationState === 'idle' || conversationState === 'error' ? 'Start' : 'Stop'}
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${color}`}></div>
            <span className="font-medium text-lg">{text}</span>
          </div>
        </div>
        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-4">
            {transcripts.map((t, i) => (
                <div key={i}>
                    <p className="flex items-center gap-2 font-semibold text-purple-300"><MicIcon/> User: <span className="font-normal text-gray-200">{t.user}</span></p>
                    <p className="flex items-center gap-2 font-semibold text-cyan-300"><HeadphonesIcon/> AI: <span className="font-normal text-gray-200">{t.model}</span></p>
                </div>
            ))}
             {(currentInput || currentOutput) && (
                <div>
                    {currentInput && <p className="flex items-center gap-2 font-semibold text-purple-300"><MicIcon/> User: <span className="font-normal text-gray-400">{currentInput}</span></p>}
                    {currentOutput && <p className="flex items-center gap-2 font-semibold text-cyan-300"><HeadphonesIcon/> AI: <span className="font-normal text-gray-400">{currentOutput}</span></p>}
                </div>
            )}
            {transcripts.length === 0 && !currentInput && !currentOutput && <p className="text-gray-500 text-center">Conversation transcript will appear here.</p>}
        </div>
      </div>
    </ToolContainer>
  );
};

export default LiveConversation;
