'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiService, AIModelType } from '@/lib/ai-integration';

interface ModelSelectorProps {
  onModelChange?: (model: AIModelType) => void;
  className?: string;
}

const models = [
  {
    value: 'grok',
    label: 'Grok AI',
    icon: Zap,
    description: 'Fast, efficient AI model with strong reasoning capabilities'
  },
  {
    value: 'gemini',
    label: 'Gemini AI',
    icon: Sparkles,
    description: 'Google\'s multimodal AI with strong creative capabilities'
  },
  {
    value: 'both',
    label: 'Both Models',
    icon: Layers,
    description: 'Combine Grok and Gemini for enhanced results'
  },
];

export function ModelSelector({ onModelChange, className }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<AIModelType>('both');

  // Initialize with the current preferred model
  useEffect(() => {
    setSelectedModel(aiService.getPreferredModel());
  }, []);

  const handleModelSelect = (model: AIModelType) => {
    setSelectedModel(model);
    aiService.setPreferredModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col space-y-2">
        {models.map((model) => (
          <Button
            key={model.value}
            variant={selectedModel === model.value ? "default" : "outline"}
            className={`flex items-center justify-between py-3 px-4 w-full ${
              selectedModel === model.value
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-900/50 hover:bg-gray-800/70 border-gray-700"
            }`}
            onClick={() => handleModelSelect(model.value as AIModelType)}
          >
            <div className="flex items-center gap-3">
              <model.icon className={`h-5 w-5 ${selectedModel === model.value ? "text-white" : "text-indigo-400"}`} />
              <div className="flex flex-col items-start">
                <span className="font-medium">{model.label}</span>
                <span className={`text-xs ${selectedModel === model.value ? "text-indigo-100" : "text-gray-400"}`}>
                  {model.description}
                </span>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
