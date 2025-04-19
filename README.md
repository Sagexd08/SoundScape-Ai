# SoundScape AI 🎵

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![npm version](https://img.shields.io/badge/npm-v9+-orange)

![SoundScape AI Banner](https://via.placeholder.com/1200x400/1e1b4b/ffffff?text=SoundScape+AI+Banner)

## Overview

SoundScape AI is an innovative web application designed to generate immersive audio environments powered by OpenAI's advanced AI models. Whether you're a content creator, gamer, or simply someone who enjoys ambient soundscapes, SoundScape AI offers a seamless experience to create, customize, and enjoy rich audio atmospheres tailored to your preferences.

Leveraging OpenAI's Text-to-Speech API and Eleven Labs' voice technology, this platform transforms your environment with dynamic soundscapes that adapt to your mood and setting. Simply describe the audio environment you want or select from our curated options, and our AI will generate a custom soundscape for you.

## 🌟 Features

- 🎧 **OpenAI-powered audio generation:** Create unique and dynamic soundscapes using OpenAI's Text-to-Speech API that adapts to your prompts and preferences.
- 🎵 **Eleven Labs voice integration:** Enhance your audio environments with natural-sounding narration and custom voice generation.
- 🔐 **Secure user authentication:** Robust authentication system supporting email/password and Google OAuth for seamless and secure access.
- 🌙 **Responsive dark theme UI:** Modern, sleek, and user-friendly interface optimized for both desktop and mobile devices.
- 🔄 **Password reset functionality:** Easy and secure password recovery to keep your account safe.
- 🎨 **Beautiful gradient UI elements:** Visually appealing design with smooth gradients and animations enhancing user experience.
- ⚡ **Fast and scalable:** Built with performance in mind to handle multiple users and real-time audio processing.
- 📱 **Cross-platform compatibility:** Accessible from any device with a web browser.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js v18 or higher installed on your machine.
- npm v9 or higher for package management.
- A Supabase account for user authentication and backend services.

### Installation

Follow these steps to get your development environment set up:

```bash
# Clone the repository
git clone https://github.com/yourusername/SoundScape-AI.git

# Navigate into the project directory
cd SoundScape-AI

# Install project dependencies
npm install

# Copy environment variables template and configure
cp .env.example .env
# Edit the .env file to add your Supabase credentials and other config

# Start the development server
npm run dev
```

### Configuration

1. Update the `.env` file with your API keys and configuration:

```
# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Eleven Labs Configuration
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=your_eleven_labs_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

2. Set up your Supabase project:
   - Create authentication providers (Email, Google OAuth)
   - Set up database tables for user profiles and saved audio

3. Configure OpenAI API access:
   - Get an API key from [OpenAI Platform](https://platform.openai.com/)
   - Enable the Text-to-Speech API for your account

4. (Optional) Set up Eleven Labs for enhanced voice capabilities:
   - Get an API key from [Eleven Labs](https://elevenlabs.io/)

## 📸 Screenshots

| Login Page | Registration Page |
|------------|-------------------|
| ![Login Page](https://via.placeholder.com/600x400/312e81/ffffff?text=Login+Page) | ![Registration Page](https://via.placeholder.com/600x400/312e81/ffffff?text=Register+Page) |

## 💻 Usage

Once the development server is running, open your browser and navigate to `http://localhost:3000` to access SoundScape AI.

- Register a new account or log in using your credentials.
- Explore the AI-powered audio environment generator.
- Customize soundscapes and save your favorites.
- Manage your profile and settings through the user dashboard.

## ❓ FAQ

**Q: What browsers are supported?**
A: SoundScape AI supports all modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Can I use my Google account to sign in?**
A: Yes, Google OAuth is integrated for easy and secure login.

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page to receive a password reset email.

**Q: Is my data secure?**
A: Yes, all user data is securely stored and managed through Supabase with encryption and best practices.

**Q: Do I need an OpenAI API key to use the audio generation features?**
A: While the application works best with your own OpenAI API key, we provide demo audio files that will be used if no API key is configured.

**Q: How does the audio generation work?**
A: We use OpenAI's Text-to-Speech API to generate audio based on your prompts. The system can also generate appropriate prompts based on your selected environment and mood preferences.

## 🛠 Tech Stack

- ⚛️ Next.js - React framework for server-side rendering and static site generation.
- 🎨 Tailwind CSS - Utility-first CSS framework for rapid UI development.
- 🔵 TypeScript - Typed superset of JavaScript for improved developer experience.
- 🔥 Supabase - Backend as a service providing authentication, database, and storage.
- 🧩 React - JavaScript library for building user interfaces.
- 🌎 OpenAI API - Advanced AI models for text-to-speech and audio generation.
- 🎵 Eleven Labs - Voice AI technology for natural-sounding narration.
- 💬 Shadcn UI - Beautifully designed components built with Radix UI and Tailwind CSS.

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request describing your changes and why they should be merged.

Please ensure your code follows the existing style and includes tests where applicable.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgements

- [Next.js Documentation](https://nextjs.org/docs) - For the powerful React framework.
- [Tailwind CSS](https://tailwindcss.com) - For the beautiful and flexible styling.
- [Supabase](https://supabase.com) - For the backend services and authentication.
- [React](https://reactjs.org) - For the UI library that powers the frontend.
- [OpenAI](https://openai.com) - For the advanced AI models that power our audio generation.
- [Eleven Labs](https://elevenlabs.io) - For the voice AI technology.
- [Shadcn UI](https://ui.shadcn.com) - For the beautiful component library.

## 📬 Contact

For questions, suggestions, or support, please reach out:

- GitHub Issues: [https://github.com/yourusername/SoundScape-AI/issues](https://github.com/yourusername/SoundScape-AI/issues)
- Email: support@soundscapeai.com
- Twitter: [@SoundScapeAI](https://twitter.com/SoundScapeAI)

## 🌐 Live Demo

Check out the live deployed application here:
[https://sound-scape-ai-sohomchatterjee07-gmailcoms-projects.vercel.app/](https://sound-scape-ai-sohomchatterjee07-gmailcoms-projects.vercel.app/)

---
Thank you for using SoundScape AI! We hope it brings your audio environments to life.
