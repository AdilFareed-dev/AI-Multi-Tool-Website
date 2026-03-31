import React from 'react';
import { Tool, ToolId, ToolCategory } from './types';
import {
  ChatBot, ImageGenerator, AIImageEditor, TextToVideo, VideoFromImage, LiveConversation, WebSearch, LocalDiscovery,
  Summarizer, TextFormatter, CodeGenerator, ComplexProblemSolver, RecipeGenerator, EmailWriter, Proofreader, StoryWriter,
  ResumeHelper, AudioTranscriber, TextToSpeech, ImageAnalyzer, VideoAnalyzer, LogoDesigner, MemeGenerator,
  BackgroundRemover, ColorPaletteGenerator
} from './components/tools';
import {
    AiIcon, BrainIcon, BookIcon, ChatIcon, CheckIcon, CodeIcon, EditIcon, EyeIcon, FileTextIcon, FilmIcon, FormatIcon,
    HeadphonesIcon, ImageIcon, LayersIcon, MailIcon, MapIcon, MicIcon, PaletteIcon, RecipeIcon, ScissorsIcon, SmileIcon,
    SummarizeIcon, VideoIcon, VolumeIcon, WebSearchIcon
} from './components/icons';

export const TOOLS: Tool[] = [
  // Content & Text
  { id: ToolId.ChatBot, name: 'Chat Bot', description: 'Have a conversation with AI.', icon: ChatIcon, component: ChatBot, category: 'Content & Text' },
  { id: ToolId.WebSearch, name: 'Web Search', description: 'Get up-to-date info from the web.', icon: WebSearchIcon, component: WebSearch, category: 'Content & Text' },
  { id: ToolId.LocalDiscovery, name: 'Local Discovery', description: 'Find places and get local info.', icon: MapIcon, component: LocalDiscovery, category: 'Content & Text' },
  { id: ToolId.Summarizer, name: 'Summarizer', description: 'Condense long text into key points.', icon: SummarizeIcon, component: Summarizer, category: 'Content & Text' },
  { id: ToolId.TextFormatter, name: 'Text Formatter', description: 'Quickly format and clean up text.', icon: FormatIcon, component: TextFormatter, category: 'Content & Text' },
  { id: ToolId.CodeGenerator, name: 'Code Generator', description: 'Generate code in any language.', icon: CodeIcon, component: CodeGenerator, category: 'Content & Text' },
  { id: ToolId.ComplexProblemSolver, name: 'Complex Problem Solver', description: 'Tackle tough problems with AI.', icon: BrainIcon, component: ComplexProblemSolver, category: 'Content & Text' },
  { id: ToolId.RecipeGenerator, name: 'Recipe Generator', description: 'Create new recipes from ingredients.', icon: RecipeIcon, component: RecipeGenerator, category: 'Content & Text' },
  { id: ToolId.EmailWriter, name: 'Email Writer', description: 'Draft professional or casual emails.', icon: MailIcon, component: EmailWriter, category: 'Content & Text' },
  { id: ToolId.Proofreader, name: 'Proofreader', description: 'Check grammar and spelling.', icon: CheckIcon, component: Proofreader, category: 'Content & Text' },
  { id: ToolId.StoryWriter, name: 'Story Writer', description: 'Generate creative stories and plots.', icon: BookIcon, component: StoryWriter, category: 'Content & Text' },
  { id: ToolId.ResumeHelper, name: 'Resume Helper', description: 'Get help writing your resume.', icon: FileTextIcon, component: ResumeHelper, category: 'Content & Text' },
  // Audio & Voice
  { id: ToolId.LiveConversation, name: 'Live Conversation', description: 'Talk with AI in real-time.', icon: HeadphonesIcon, component: LiveConversation, category: 'Audio & Voice' },
  { id: ToolId.AudioTranscriber, name: 'Audio Transcriber', description: 'Transcribe spoken words to text.', icon: MicIcon, component: AudioTranscriber, category: 'Audio & Voice' },
  { id: ToolId.TextToSpeech, name: 'Text to Speech', description: 'Convert text into spoken audio.', icon: VolumeIcon, component: TextToSpeech, category: 'Audio & Voice' },
  // Image & Video
  { id: ToolId.ImageGenerator, name: 'Image Generator', description: 'Create images from text prompts.', icon: ImageIcon, component: ImageGenerator, category: 'Image & Video' },
  { id: ToolId.AIImageEditor, name: 'AI Image Editor', description: 'Edit images with text commands.', icon: EditIcon, component: AIImageEditor, category: 'Image & Video' },
  { id: ToolId.ImageAnalyzer, name: 'Image Analyzer', description: 'Understand the content of an image.', icon: EyeIcon, component: ImageAnalyzer, category: 'Image & Video' },
  { id: ToolId.TextToVideo, name: 'Text to Video', description: 'Generate videos from text prompts.', icon: VideoIcon, component: TextToVideo, category: 'Image & Video' },
  { id: ToolId.VideoFromImage, name: 'Video from Image', description: 'Animate a static image.', icon: FilmIcon, component: VideoFromImage, category: 'Image & Video' },
  { id: ToolId.VideoAnalyzer, name: 'Video Analyzer', description: 'Analyze frames from a video.', icon: AiIcon, component: VideoAnalyzer, category: 'Image & Video' },
  { id: ToolId.LogoDesigner, name: 'Logo Designer', description: 'Design a unique logo for your brand.', icon: LayersIcon, component: LogoDesigner, category: 'Image & Video' },
  { id: ToolId.MemeGenerator, name: 'Meme Generator', description: 'Create funny memes instantly.', icon: SmileIcon, component: MemeGenerator, category: 'Image & Video' },
  { id: ToolId.BackgroundRemover, name: 'Background Remover', description: 'Remove the background from images.', icon: ScissorsIcon, component: BackgroundRemover, category: 'Image & Video' },
  { id: ToolId.ColorPaletteGenerator, name: 'Color Palette Generator', description: 'Extract color palettes from images.', icon: PaletteIcon, component: ColorPaletteGenerator, category: 'Image & Video' },
];

export const CATEGORIES: ToolCategory[] = ['Content & Text', 'Audio & Voice', 'Image & Video'];
