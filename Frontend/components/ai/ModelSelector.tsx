'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Sparkles, Zap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-montserrat border-gray-700 bg-gray-900/50 hover:bg-gray-800/70",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {models.find(model => model.value === selectedModel)?.icon && (
              <models.find(model => model.value === selectedModel)!.icon className="h-4 w-4 text-indigo-400" />
            )}
            <span>{models.find(model => model.value === selectedModel)?.label || "Select Model"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-gray-700 bg-gray-900 text-gray-200">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search AI models..." className="border-gray-700 bg-gray-900 text-gray-200" />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {models.map((model) => (
              <CommandItem
                key={model.value}
                value={model.value}
                onSelect={() => handleModelSelect(model.value as AIModelType)}
                className="flex items-center gap-2 hover:bg-gray-800"
              >
                <model.icon className="h-4 w-4 text-indigo-400" />
                <div className="flex flex-col">
                  <span>{model.label}</span>
                  <span className="text-xs text-gray-400">{model.description}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedModel === model.value ? "opacity-100 text-indigo-500" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
