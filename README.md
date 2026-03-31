# 🤖 AI Multi-Tool Suite

> A powerful, all-in-one web application featuring **25 AI-powered tools** for content creation, image generation, video production, voice interaction, and more — all powered by the **Google Gemini API**.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

[View Repo](https://github.com/AdilFareed-dev/AI-Multi-Tool-Website) · [Report Bug](https://github.com/AdilFareed-dev/AI-Multi-Tool-Website/issues) · [Request Feature](https://github.com/AdilFareed-dev/AI-Multi-Tool-Website/issues)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Tools Overview](#-tools-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🚀 About the Project

**AI Multi-Tool Suite** is a comprehensive React web application that brings 25 AI-powered tools together in a single, clean dashboard. Built on top of Google's **Gemini 2.5 Flash** model, the suite covers everything from chatting with AI and generating images to real-time voice conversations and video creation.

The project started as a personal deep-dive into the Gemini API — and evolved into a full-featured platform. Currently **5 tools are fully functional**, with the remaining 20 actively being developed.

### ✨ Key Highlights

- 🔥 25 tools across 3 categories in one unified dashboard
- ⚡ Streaming responses — real-time AI output with no waiting
- 🎙️ Live voice conversation — talk to AI using your microphone
- 🖼️ Image generation & editing — create and modify images with text
- 🎬 Video generation — animate images or generate video from text
- 📱 Fully responsive — works on desktop and mobile
- 🌙 Dark theme by default

---

## 🛠️ Tools Overview

### ✅ Fully Functional — 5 of 25

| Tool | Category | Description |
|------|----------|-------------|
| 💬 Chat Bot | Content & Text | Full streaming chat with Gemini 2.5 Flash |
| 🎙️ Live Conversation | Audio & Voice | Real-time two-way voice conversation with AI |
| 🖼️ Image Generator | Image & Video | Generate images from text prompts |
| ✏️ AI Image Editor | Image & Video | Edit and transform images using text commands |
| 🎬 Text to Video / Video from Image | Image & Video | Generate video from text or animate static images |

---

### 🔄 In Progress — 20 of 25

#### Content & Text

| Tool | Description |
|------|-------------|
| 🌐 Web Search | Get up-to-date information from the web |
| 📍 Local Discovery | Find places and get local recommendations |
| 📝 Summarizer | Condense long text into key points |
| 🔤 Text Formatter | Format and clean up text instantly |
| 💻 Code Generator | Generate code in any programming language |
| 🧠 Complex Problem Solver | Tackle difficult problems step by step |
| 🍽️ Recipe Generator | Create recipes from available ingredients |
| 📧 Email Writer | Draft professional or casual emails |
| ✅ Proofreader | Check grammar, spelling and style |
| 📖 Story Writer | Generate creative stories and plots |
| 📄 Resume Helper | Build and improve your resume with AI |

#### Audio & Voice

| Tool | Description |
|------|-------------|
| 🎤 Audio Transcriber | Convert spoken audio to text |
| 🔊 Text to Speech | Convert any text into natural audio |

#### Image & Video

| Tool | Description |
|------|-------------|
| 👁️ Image Analyzer | Understand and describe image content |
| 🎥 Video Analyzer | Analyze and extract info from video frames |
| 🏷️ Logo Designer | Design unique logos for your brand |
| 😂 Meme Generator | Create funny memes instantly |
| ✂️ Background Remover | Remove backgrounds from images |
| 🎨 Color Palette Generator | Extract color palettes from images |

---

## 💻 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **@google/genai** | 1.27.0 | Gemini API SDK |
| **Gemini 2.5 Flash** | Latest | AI model for all tools |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A **Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AdilFareed-dev/AI-Multi-Tool-Website.git
cd AI-Multi-Tool-Website
```

**2. Install dependencies**

```bash
npm install
```

**3. Set your API key**

Open `.env.local` and add your Gemini API key:

```env
API_KEY=your_gemini_api_key_here
```

**4. Run the development server**

```bash
npm run dev
```

**5. Open in browser**

```
http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
ai-multi-tool-suite/
├── components/
│   ├── common/
│   │   ├── ApiKeyDialog.tsx        # API key prompt dialog
│   │   ├── LoadingSpinner.tsx      # Reusable loading component
│   │   └── ToolContainer.tsx       # Wrapper for all tools
│   ├── icons/
│   │   └── index.tsx               # All SVG icons
│   ├── tools/
│   │   ├── ChatBot.tsx             # ✅ Streaming chat tool
│   │   ├── ImageGenerator.tsx      # ✅ Text-to-image tool
│   │   ├── AIImageEditor.tsx       # ✅ Image editing tool
│   │   ├── TextToVideo.tsx         # ✅ Video generation tool
│   │   ├── VideoFromImage.tsx      # ✅ Image animation tool
│   │   ├── LiveConversation.tsx    # ✅ Real-time voice tool
│   │   ├── PlaceholderTool.tsx     # Template for upcoming tools
│   │   └── index.tsx               # Tool exports
│   └── ToolGrid.tsx                # Main dashboard grid
├── utils/
│   ├── audioUtils.ts               # Audio encoding/decoding helpers
│   └── fileUtils.ts                # File handling helpers
├── App.tsx                         # Root component & navigation
├── constants.tsx                   # All 25 tool definitions
├── types.ts                        # TypeScript interfaces & enums
├── index.tsx                       # App entry point
├── index.html                      # HTML template
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

---

## 🌐 Deployment

### Deploy on Vercel (Recommended)

**1.** Push your code to GitHub

**2.** Go to [vercel.com](https://vercel.com) and import your repo

**3.** Add environment variable in Vercel dashboard:
- **Name:** `API_KEY`
- **Value:** your Gemini API key

**4.** Make sure your `vite.config.ts` contains:

```ts
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  }
})
```

**5.** Click **Deploy** ✅

### Deploy on Netlify

**1.** Push your code to GitHub

**2.** Go to [netlify.com](https://netlify.com) and import your repo

**3.** Set build settings:
- Build command: `npm run build`
- Publish directory: `dist`

**4.** Add `API_KEY` in Site Settings → Environment Variables

**5.** Deploy ✅

---

## 🗺️ Roadmap

- [x] Project architecture & tool grid dashboard
- [x] Chat Bot with streaming responses
- [x] Live voice conversation
- [x] Image Generator
- [x] AI Image Editor
- [x] Text to Video & Video from Image
- [ ] Web Search tool
- [ ] Summarizer & Text Formatter
- [ ] Code Generator
- [ ] Email Writer & Proofreader
- [ ] Story Writer & Resume Helper
- [ ] Audio Transcriber & Text to Speech
- [ ] Image Analyzer & Video Analyzer
- [ ] Logo Designer & Meme Generator
- [ ] Background Remover & Color Palette Generator
- [ ] Local Discovery tool
- [ ] Mobile PWA support

---

## 🤝 Contributing

Contributions are welcome! To implement one of the placeholder tools:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/summarizer-tool`
3. Build your tool inside `components/tools/` following the existing pattern
4. Register it in `constants.tsx` by replacing the `createPlaceholder` call
5. Commit: `git commit -m "feat: implement Summarizer tool"`
6. Push and open a Pull Request

---

## ⚠️ Important Notes

- Never commit your `.env.local` file — it is in `.gitignore` by default
- Gemini API has free tier rate limits — heavy usage may require a paid plan
- Live Conversation requires microphone permission in the browser
- Local Discovery requires location permission in the browser

---

## 📄 License

Distributed under the MIT License.

---

## 📬 Contact

**Adil Fareed** — Android & Web Developer



**Project Link:** https://github.com/AdilFareed-dev/AI-Multi-Tool-Website

---

> If you found this project useful, please consider giving it a ⭐ — it means a lot!
>
> Built with ❤️ using React, TypeScript & Google Gemini API
