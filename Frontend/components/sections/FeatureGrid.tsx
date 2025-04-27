import React from 'react';
import FeatureCard from '../ui/FeatureCard';
import { IconType } from 'react-icons';
import { FiAward, FiEdit3, FiMusic, FiSliders, FiTrendingUp, FiZap } from 'react-icons/fi';

interface Feature {
  title: string;
  description: string;
  icon: IconType;
}

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'elevated' | 'bordered' | 'minimal';
}

const defaultFeatures: Feature[] = [
  {
    title: 'Smart Audio Creation',
    description: 'Create studio-quality soundtracks with our AI-powered tools in minutes.',
    icon: FiMusic
  },
  {
    title: 'Advanced Customization',
    description: 'Fine-tune every aspect of your audio with intuitive controls and presets.',
    icon: FiSliders
  },
  {
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with team members from anywhere in the world.',
    icon: FiEdit3
  },
  {
    title: 'Performance Analytics',
    description: 'Track how your audio performs across platforms with detailed insights.',
    icon: FiTrendingUp
  },
  {
    title: 'Lightning Fast Export',
    description: 'Export your projects in multiple formats optimized for any platform.',
    icon: FiZap
  },
  {
    title: 'Professional Quality',
    description: 'Industry-standard output that meets the needs of professionals.',
    icon: FiAward
  }
];

const FeatureGrid: React.FC<FeatureGridProps> = ({
  title = 'Powerful Features',
  subtitle = 'Everything you need to create amazing soundscapes',
  features = defaultFeatures,
  columns = 3,
  variant = 'default'
}) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <section className="section">
      <div className="container">
        {(title || subtitle) && (
          <div className="max-w-3xl mx-auto text-center mb-12">
            {title && <h2 className="heading-lg mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols[columns]} gap-8`}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;