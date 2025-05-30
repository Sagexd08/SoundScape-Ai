# 🎵 SoundScape AI

> AI-powered audio environments that adapt to your surroundings and mood in real-time.

<div align="center">
  <img src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745427929/Screenshot_2025-04-23_223435_ahljcf.png" alt="SoundScape AI Logo" width="150"/>

  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![License](https://img.shields.io/badge/license-MIT-blue)
  ![AI Models](https://img.shields.io/badge/AI%20Models-3-purple)
  ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)
</div>

---

## 📌 Problem Statement

**Problem Statement 1 – Weave AI Magic With Grok**

Build a creative and multimodal tool powered by Grok, leveraging its capabilities to create innovative solutions.

---

## 🎯 Objective

SoundScape AI transforms audio experiences by harnessing Grok's powerful AI capabilities to create personalized, adaptive soundscapes that respond to users' surroundings, activities, and emotional states in real-time.

Our platform serves content creators, meditation practitioners, productivity enthusiasts, and anyone seeking immersive audio experiences. By placing Grok at the center of our multi-AI collaboration approach (alongside OpenAI and Gemini), we showcase Grok's ability to generate detailed audio prompts, analyze audio content, and enhance creative elements in soundscape generation.

---

## 🧠 Team & Approach

### Team Name:
`Team DevOPs`

### Team Members:
- Sohom Chatterjee ([GitHub](https://github.com/Sagexd08) / Team Leader)
- Rajshree Talukdar (Frontend Developer)
- Saikat Maji (Backend Developer)
- Eshani Paul (AI Integration Specialist)

### Our Approach:
- We chose this problem because audio experiences remain largely static despite advances in AI, presenting an opportunity to create truly adaptive environments.
- Key challenges we addressed include integrating multiple AI models for enhanced creativity, implementing real-time adaptation to user context, and creating an intuitive interface for audio customization.
- Our breakthrough came when we developed a collaborative AI approach that combines the strengths of different models (Grok for detailed prompts, Gemini for creative enhancement, and OpenAI for high-quality synthesis).

---

## 🛠️ Tech Stack

### Core Technologies Used:
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase for authentication and database
- **Database:** Supabase PostgreSQL
- **AI:** OpenAI API, Grok API, Gemini API
- **Context Capture:** Screenpipe for screen and audio recording
- **Hosting:** Vercel
- **Authentication:** Supabase Auth with Google OAuth
- **UI Components:** shadcn/ui
- **3D Graphics:** Three.js

### Sponsor Technologies Used:
- [✅] **Grok:** Central to our platform, used for detailed audio prompt generation, creative enhancement, and audio analysis
- [✅] **Screenpipe:** Integrated for context-aware screen and audio capture, enabling environment detection and real-time adaptation
- [ ] **Monad:** _Not implemented in current version_
- [ ] **Fluvio:** _Not implemented in current version_
- [ ] **Base:** _Not implemented in current version_
- [ ] **Stellar:** _Not implemented in current version_

---

## ✨ Key Features

<div align="center">
  <img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.38.35_372fbb13_iuvgdy.jpg" alt="SoundScape Features" width="600"/>
</div>

- ✅ **Grok-Powered Audio Generation:** Leveraging Grok's advanced capabilities for detailed audio prompt creation
- ✅ **Multi-AI Collaboration:** Grok at the center of our AI ecosystem, working with Gemini and OpenAI for enhanced results
- ✅ **Environment-Based Audio:** Generate soundscapes based on different environments (forest, ocean, city, cafe)
- ✅ **Mood-Based Customization:** Tailor audio to emotional states (relaxing, energetic, focused, peaceful) with suggested tracks and audio playback
- ✅ **Grok Audio Analysis:** Analyze audio files to extract detailed insights using Grok's advanced understanding capabilities
- ✅ **AI Music Generation:** Create custom music with Grok-enhanced prompts controlling genre, mood, and instruments
- ✅ **Real-Time Adaptation:** Audio environments that adapt to surroundings and context with ANC (Active Noise Cancellation) and ENC (Environmental Noise Control)
- ✅ **Screenpipe Integration:** Capture screen and audio content to automatically generate perfectly matched soundscapes with 100% local processing
- ✅ **Audio File Upload & Analysis:** Upload and analyze your own audio files with detailed visualization and insights
- ✅ **Track Download Options:** Download your favorite generated tracks directly from the player interface
- ✅ **3D Interactive Elements:** Immersive 3D elements on the landing page for enhanced visual experience
- ✅ **Vibrant Cosmic Backgrounds:** Dynamic, animated backgrounds across all pages for a consistent visual theme
- ✅ **GitHub Authentication:** Additional authentication option for seamless user experience

---

## 🔄 Latest Updates (April 2025)

We've recently enhanced the AI Studio page with several new features:

- **Screenpipe Integration:** Added 100% local screen and audio capture for context-aware soundscape generation
- **Mood-Based Audio Suggestions:** Browse and play suggested tracks for each mood
- **Audio Playback Controls:** Full-featured audio player with volume, progress tracking, and download options
- **ANC/ENC Technology:** Added Active Noise Cancellation and Environmental Noise Control to the Real-Time Adaptation feature
- **Quick Environment Selection:** Easily select from popular environments without using the camera
- **Enhanced UI:** Improved styling with consistent shadows, better visual hierarchy, and more intuitive controls

## 🐛 Technical Challenges & Solutions

### React Error #310: Hooks Rendering Challenge

During our development process, we encountered a significant technical challenge with React's client-side rendering in Next.js 15, specifically the "Rendered more hooks than during the previous render" error (React Error #310).

**The Challenge:**
- Our animated background components were causing inconsistent hook calls between server and client rendering
- This resulted in a first-load error on deployed environments, though the application would work correctly on subsequent renders
- The error was particularly challenging because it only manifested in production builds

**Our Solution:**
- We implemented a robust "ClientOnly" pattern that properly separates client and server rendering concerns
- Created dedicated components for animations that only execute in browser environments
- Used React.useMemo to optimize random particle generation
- Implemented a static fallback for server-side rendering
- Carefully managed hook execution order to ensure consistency
- Added a specialized error boundary that detects React Error #310 specifically
- Implemented a user-friendly "Try Again" button that automatically reloads the page when this error occurs

**If You Encounter This Error:**
If you see the "React Error #310" message while using our application, simply click the "Try Again" button. This will reload the page and resolve the issue. This is a known limitation with React's strict rules for hooks when using complex animations and 3D elements, especially on first page load.

<div align="center">
  <img src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png" alt="React Error 310 Solution" width="400"/>
  <p><i>Our custom error handler with "Try Again" button for React Error #310</i></p>
</div>

This experience demonstrates our team's problem-solving abilities and deep understanding of React's rendering lifecycle. Our solution significantly improved stability and showcases our technical expertise in handling complex front-end challenges.

## 📽️ Demo & Deliverables

- **Live Demo:** [https://sound-scape-ai-psi.vercel.app/](https://sound-scape-ai-psi.vercel.app/)
- **Demo Video Link:** [https://youtu.be/rza-BmIgO90](https://youtu.be/rza-BmIgO90)
- **Pitch Deck / PPT Link:** [Google Slides Presentation](https://docs.google.com/presentation/d/1VzCHzF8b_HBLjiXi-PNAnV-7aONFGm7xMzX2QirA0-g/edit?usp=sharing)
- **GitHub Repository:** [https://github.com/Sagexd08/SoundScape-Ai](https://github.com/Sagexd08/SoundScape-Ai)

<div align="center">
  <table>
    <tr>
      <td><img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.38.17_a7bcb060_rarpmc.jpg" alt="Dashboard" width="400"/></td>
      <td><img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.39.12_a0baa83c_pnmxsk.jpg" alt="AI Studio" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>Dashboard</b></td>
      <td align="center"><b>AI Studio</b></td>
    </tr>
    <tr>
      <td><img src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png" alt="Mood-Based Audio" width="400"/></td>
      <td><img src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png" alt="Real-Time Adaptation" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>Mood-Based Audio with Playback</b></td>
      <td align="center"><b>Real-Time Adaptation with ANC/ENC</b></td>
    </tr>
  </table>
</div>

---

## ✅ Tasks & Bonus Checklist

- [✅] **All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form**
- [✅] **All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points)**
- [✅] **All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points)**

---

## 🧪 How to Run the Project

### Requirements:
- Node.js 18.17.0 or later
- npm or yarn
- Supabase account
- OpenAI API key (optional for full functionality)

### Local Setup:
```bash
# Clone the repo
git clone https://github.com/Sagexd08/SoundScape-Ai.git

# Install dependencies
cd SoundScape-Ai/Frontend
npm install --legacy-peer-deps

# Set up environment variables
# Create a .env.local file with the following:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key (optional)

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application running locally.

---

## 🧬 Future Scope

<div align="center">
  <img src="https://res.cloudinary.com/dporz9gz6/image/upload/v1745176839/WhatsApp_Image_2025-04-21_at_00.41.17_b0ad1551_d2ku9y.jpg" alt="Future Scope" width="600"/>
</div>

- 📈 **Mobile Applications:** Develop native iOS and Android apps for on-the-go audio experiences
- 🎧 **Hardware Integration:** Connect with smart speakers and headphones for enhanced spatial audio
- 🧠 **Advanced Biofeedback:** Integrate with wearables to adapt audio based on heart rate, stress levels, and other biometrics
- 🌐 **Collaborative Environments:** Allow multiple users to share and experience the same audio environment
- 🤖 **Enhanced AI Models:** Implement more specialized AI models for specific audio genres and use cases
- 🔊 **Spatial Audio:** Implement 3D audio positioning for truly immersive experiences

---

## 📎 Resources / Credits

- [OpenAI](https://openai.com/) for their Text-to-Speech API
- [Supabase](https://supabase.io/) for authentication and database services
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Three.js](https://threejs.org/) for 3D graphics
- [Cloudinary](https://cloudinary.com/) for image hosting

---

## 🏁 Final Words

Our hackathon journey with SoundScape AI has been an incredible learning experience. We faced challenges integrating multiple AI models and ensuring they worked harmoniously, but the result is a platform that truly transforms how people experience audio.

We're particularly proud of our multi-AI collaboration approach, which demonstrates how different AI models can complement each other to create something greater than the sum of their parts.

We believe SoundScape AI has the potential to revolutionize various fields, from meditation and wellness to productivity and entertainment, by providing personalized, adaptive audio environments that enhance human experiences.

---

<div align="center">
  <p>Built with ❤️ by Team DevOPs</p>
  <p>
    <a href="https://sound-scape-ai-psi.vercel.app/">Live Demo</a> •
    <a href="https://github.com/Sagexd08/SoundScape-Ai">GitHub</a>
  </p>
</div>
