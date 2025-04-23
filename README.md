# SoundScape AI 🎵🧠

<div align="center">
  <img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.32.24_07531d8b_rzgeo2.jpg" alt="SoundScape AI" width="800"/>
  
  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) 
  ![License](https://img.shields.io/badge/license-MIT-blue) 
  ![npm version](https://img.shields.io/badge/npm-v9+-orange)
  ![AI Models](https://img.shields.io/badge/AI%20Models-3-purple)
  ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)
</div>

<p align="center">
  <b>AI-powered audio environments that adapt to your surroundings and mood in real-time</b>
</p>

## 🌟 Overview

SoundScape AI is a cutting-edge platform that leverages multiple AI models to create personalized audio environments that adapt to your surroundings and mood in real-time. Our application combines the power of **OpenAI**, **Grok**, and **Gemini** to deliver an unparalleled audio experience.

🌐 **Live Demo**: [https://soundscape-ai-project.vercel.app/](https://soundscape-ai-project.vercel.app/)

## 🚀 Features

<table>
  <tr>
    <td width="50%">
      <h3>🎧 AI Audio Generation</h3>
      <ul>
        <li>Create custom soundscapes with simple text prompts</li>
        <li>Environment-based audio generation (forest, ocean, city, cafe)</li>
        <li>Mood-based customization (relaxing, energetic, focused, peaceful)</li>
        <li>Multi-AI prompt enhancement using both Grok and Gemini</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎵 AI Music Creation</h3>
      <ul>
        <li>Generate custom music tracks with control over genre, mood, and instruments</li>
        <li>Collaborative AI approach using multiple models for enhanced creativity</li>
        <li>Customizable tempo and duration settings</li>
        <li>Genre-specific music generation with AI-powered composition</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Audio Analysis</h3>
      <ul>
        <li>Analyze audio files to extract insights and features</li>
        <li>Identify mood, instruments, and acoustic characteristics</li>
        <li>Powered by Grok's advanced audio understanding capabilities</li>
        <li>Detailed acoustic feature extraction and visualization</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔄 Real-Time Adaptation</h3>
      <ul>
        <li>Audio environments that adapt to your surroundings</li>
        <li>Mood-responsive sound generation</li>
        <li>Seamless transitions between different environments</li>
        <li>Context-aware audio adjustments based on time and activity</li>
      </ul>
    </td>
  </tr>
</table>

## 🧠 AI Integration

<div align="center">
  <img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.41.17_b0ad1551_d2ku9y.jpg" alt="AI Integration" width="600"/>
</div>

SoundScape AI uniquely combines multiple AI models to create a superior audio experience:

### 🤖 Grok AI Integration
- Used for generating detailed audio prompts
- Provides advanced audio analysis capabilities
- Enhances creative elements in soundscape generation
- Ultra-fast processing with low latency

### 🔮 Gemini AI Integration
- Creates rich, descriptive audio environments
- Enhances prompts with creative details
- Provides multimodal understanding for better audio context
- Specialized in creative content generation

### 🎭 OpenAI Integration
- Powers the core audio generation capabilities
- Text-to-speech functionality for narration
- High-quality voice synthesis
- Advanced audio processing algorithms

## 🛠️ Technology Stack

<table>
  <tr>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/next-js.svg" width="40" height="40"/><br>Next.js</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/react-2.svg" width="40" height="40"/><br>React</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/typescript.svg" width="40" height="40"/><br>TypeScript</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/tailwind-css-2.svg" width="40" height="40"/><br>Tailwind CSS</td>
  </tr>
  <tr>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/supabase-logo.svg" width="40" height="40"/><br>Supabase</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/openai-2.svg" width="40" height="40"/><br>OpenAI</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/vercel.svg" width="40" height="40"/><br>Vercel</td>
    <td align="center"><img src="https://cdn.worldvectorlogo.com/logos/framer-motion.svg" width="40" height="40"/><br>Framer Motion</td>
  </tr>
</table>

## 📋 Getting Started

### Prerequisites
- Node.js 18.17.0 or later
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sagexd08/SoundScape-Ai.git
   cd SoundScape-Ai
   ```

2. Install dependencies:
   ```bash
   cd Frontend
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:
   Create a `.env.local` file in the Frontend directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_GROK_API_KEY=your_grok_api_key (optional)
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key (optional)
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏆 Hackathon-Ready Features

<div align="center">
  <img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.38.35_372fbb13_iuvgdy.jpg" alt="Hackathon Features" width="600"/>
</div>

SoundScape AI includes several innovative features that make it stand out in hackathon competitions:

### 1. Multi-AI Collaboration
Our platform uniquely combines multiple AI models (Grok, Gemini, and OpenAI) to create a collaborative AI system that generates superior audio experiences. Each AI contributes its strengths:
- **Grok**: Detailed prompt generation and audio analysis
- **Gemini**: Creative enhancement and multimodal understanding
- **OpenAI**: High-quality audio synthesis

### 2. Adaptive Audio Environments
The application creates audio environments that adapt in real-time to:
- User's physical surroundings (detected through device sensors)
- Emotional state (selected or detected)
- Time of day and activity context

### 3. Advanced Audio Analysis
Our Grok-powered audio analyzer provides detailed insights about audio files:
- Mood and emotional tone detection
- Instrument and sound source identification
- Acoustic feature extraction and analysis
- Personalized recommendations based on listening patterns

### 4. Innovative UI/UX
- Immersive 3D audio visualization using Three.js
- Responsive design that works across all devices
- Intuitive controls for audio customization
- Seamless authentication and user experience


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for their Text-to-Speech API
- [Supabase](https://supabase.io/) for authentication and database services
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Three.js](https://threejs.org/) for 3D graphics

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Sagexd08">Sohom Chatterjee</a></p>
  <p>
    <a href="https://soundscape-ai-project.vercel.app/">Live Demo</a> •
    <a href="https://github.com/Sagexd08/SoundScape-Ai">GitHub</a>
  </p>
</div>
