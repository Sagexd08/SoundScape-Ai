import React from 'react';
import Head from 'next/head';
import { Layers, Cpu, Sliders, Headphones, Download, Users, Save, BarChart2 } from 'lucide-react';
import FeatureGrid from '../components/sections/FeatureGrid';

const StudioPage = () => {
  const studioFeatures = [
    {
      title: 'AI Audio Generation',
      description: 'Generate high-quality audio with state-of-the-art neural networks that understand your creative vision.',
      icon: Cpu
    },
    {
      title: 'Multi-track Composition',
      description: 'Layer multiple tracks with our intuitive interface for complete creative control over your project.',
      icon: Layers
    },
    {
      title: 'Advanced Mixing Tools',
      description: 'Professional-grade mixing tools with presets and customizable parameters for the perfect sound.',
      icon: Sliders
    },
    {
      title: 'Intelligent Mastering',
      description: 'One-click mastering that adapts to your audio and delivers studio-quality results instantly.',
      icon: Headphones
    },
    {
      title: 'Universal Export',
      description: 'Export your audio in multiple formats optimized for streaming, film, games, or any platform you need.',
      icon: Download
    },
    {
      title: 'Collaborative Projects',
      description: 'Invite team members to collaborate in real-time with built-in version control and comments.',
      icon: Users
    },
    {
      title: 'Cloud Workspaces',
      description: 'Access your projects from anywhere with secure cloud storage and automatic backups.',
      icon: Save
    },
    {
      title: 'Usage Analytics',
      description: 'Track how your content performs with detailed analytics on playback, engagement, and more.',
      icon: BarChart2
    }
  ];

  return (
    <>
      <Head>
        <title>AI Studio | SoundScape AI</title>
        <meta name="description" content="Create studio-quality soundtracks with AI-powered tools" />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
                AI-Powered Audio Studio
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Create professional soundscapes, music, and effects with the power of artificial intelligence
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary px-8 py-3 text-base">
                  Start Creating
                </button>
                <button className="btn btn-secondary px-8 py-3 text-base">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <FeatureGrid
          title="Studio Features"
          subtitle="Everything you need to bring your audio projects to life"
          features={studioFeatures}
          columns={4}
          variant="elevated"
        />

        {/* How It Works Section */}
        <section className="section bg-gray-50 dark:bg-gray-900">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="heading-lg mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our AI studio simplifies the audio creation process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Describe Your Vision</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use natural language to tell our AI what you want to create
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate & Refine</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI creates initial compositions that you can customize
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Export & Share</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Download in multiple formats or share directly to platforms
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to transform your audio creation process?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Join thousands of creators already using SoundScape AI
              </p>
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-md font-medium shadow-lg transition-colors">
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default StudioPage;