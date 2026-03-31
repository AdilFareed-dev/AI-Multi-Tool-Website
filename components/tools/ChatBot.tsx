
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ChatMessage } from '../../types';

const ChatBot = ({ onBack }: { onBack: () => void }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and friendly chatbot.',
        },
      });
      setChat(chatInstance);
    } catch (e) {
        setError('Failed to initialize the AI model. Please check your API key.');
        console.error(e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let fullResponse = '';
      const responseStream = await chat.sendMessageStream({ message: input });

      const modelMessage: ChatMessage = { role: 'model', text: '' };
      setMessages(prev => [...prev, modelMessage]);

      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      setMessages(prev => prev.slice(0, -1)); // Remove the empty model message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Chat Bot" onBack={onBack}>
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length-1].role === 'user' && (
             <div className="flex justify-start">
               <div className="max-w-lg p-3 rounded-lg bg-gray-700 flex items-center">
                 <LoadingSpinner size="w-5 h-5" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || !chat}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !chat}
            className="bg-purple-600 text-white px-6 py-3 rounded-r-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </ToolContainer>
  );
};

export default ChatBot;

