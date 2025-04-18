'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { FileAudio, Upload, Loader2, BarChart3, Music, Waveform } from 'lucide-react';
import { post } from '@/lib/fetch-wrapper';
import { toast } from 'sonner';

export default function AudioAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState('grok'); // 'grok' or 'gemini'
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      
      setFile(selectedFile);
      setAnalysisResults(null);
    }
  };
  
  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select an audio file');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', selectedModel);
      
      const response = await post('/api/audio/analyze', formData);
      
      setAnalysisResults(response);
      toast.success('Audio analysis complete!');
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast.error('Failed to analyze audio. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Analysis Results</h3>
        
        {analysisResults.genre && (
          <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
            <h4 className="font-medium flex items-center mb-2">
              <Music className="h-4 w-4 mr-2 text-indigo-400" />
              Genre Classification
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysisResults.genre).map(([genre, confidence]: [string, any]) => (
                <div key={genre} className="flex justify-between">
                  <span className="text-gray-300">{genre}</span>
                  <span className="text-gray-400">{(confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysisResults.emotion && (
          <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
            <h4 className="font-medium flex items-center mb-2">
              <BarChart3 className="h-4 w-4 mr-2 text-indigo-400" />
              Emotional Qualities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysisResults.emotion).map(([emotion, confidence]: [string, any]) => (
                <div key={emotion} className="flex justify-between">
                  <span className="text-gray-300">{emotion}</span>
                  <span className="text-gray-400">{(confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysisResults.features && (
          <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
            <h4 className="font-medium flex items-center mb-2">
              <Waveform className="h-4 w-4 mr-2 text-indigo-400" />
              Audio Features
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysisResults.features).map(([feature, value]: [string, any]) => (
                <div key={feature} className="flex justify-between">
                  <span className="text-gray-300">{feature}</span>
                  <span className="text-gray-400">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysisResults.description && (
          <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
            <h4 className="font-medium flex items-center mb-2">
              <FileAudio className="h-4 w-4 mr-2 text-indigo-400" />
              AI Description
            </h4>
            <p className="text-gray-300 whitespace-pre-line">{analysisResults.description}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-indigo-400" />
          AI Audio Analyzer
        </CardTitle>
        <CardDescription>
          Analyze audio files to extract insights and features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="grok" onValueChange={(value) => setSelectedModel(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grok">Grok AI</TabsTrigger>
            <TabsTrigger value="gemini">Gemini AI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grok" className="mt-4">
            <p className="text-sm text-gray-400 mb-4">
              Grok provides detailed audio feature extraction and technical analysis.
            </p>
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-4">
            <p className="text-sm text-gray-400 mb-4">
              Gemini offers rich descriptive analysis and emotional interpretation.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="border-2 border-dashed border-gray-800 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-2">
              <FileAudio className="h-10 w-10 text-indigo-400 mx-auto" />
              <p className="text-gray-300">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <Button variant="outline" size="sm" onClick={triggerFileInput}>
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 text-gray-500 mx-auto" />
              <p className="text-gray-300">Drag and drop an audio file or click to browse</p>
              <p className="text-sm text-gray-500">
                Supports MP3, WAV, FLAC, AAC, OGG (max 10MB)
              </p>
              <Button variant="outline" onClick={triggerFileInput}>
                Select File
              </Button>
            </div>
          )}
        </div>
        
        {renderAnalysisResults()}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !file} 
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Audio
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
