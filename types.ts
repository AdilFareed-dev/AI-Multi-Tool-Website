import { ComponentType } from 'react';

// Fix: The error indicates another declaration expects the type to be `AIStudio`.
// This defines the interface and uses it to resolve the conflict.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Fix: Centralize the 'window.aistudio' type declaration to avoid conflicts.
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

export enum ToolId {
  ChatBot = 'ChatBot',
  WebSearch = 'WebSearch',
  LocalDiscovery = 'LocalDiscovery',
  Summarizer = 'Summarizer',
  TextFormatter = 'TextFormatter',
  CodeGenerator = 'CodeGenerator',
  ComplexProblemSolver = 'ComplexProblemSolver',
  RecipeGenerator = 'RecipeGenerator',
  EmailWriter = 'EmailWriter',
  Proofreader = 'Proofreader',
  StoryWriter = 'StoryWriter',
  ResumeHelper = 'ResumeHelper',
  LiveConversation = 'LiveConversation',
  AudioTranscriber = 'AudioTranscriber',
  TextToSpeech = 'TextToSpeech',
  ImageGenerator = 'ImageGenerator',
  AIImageEditor = 'AIImageEditor',
  ImageAnalyzer = 'ImageAnalyzer',
  TextToVideo = 'TextToVideo',
  VideoFromImage = 'VideoFromImage',
  VideoAnalyzer = 'VideoAnalyzer',
  LogoDesigner = 'LogoDesigner',
  MemeGenerator = 'MemeGenerator',
  BackgroundRemover = 'BackgroundRemover',
  ColorPaletteGenerator = 'ColorPaletteGenerator',
}

export type ToolCategory = 'Content & Text' | 'Audio & Voice' | 'Image & Video';

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<{ onBack: () => void }>;
  category: ToolCategory;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}