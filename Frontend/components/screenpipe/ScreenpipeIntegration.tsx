'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Camera, Mic, Eye, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

// This component handles Screenpipe integration for SoundScape AI
export default function ScreenpipeIntegration({ 
  onContentAnalyzed 
}: { 
  onContentAnalyzed?: (data: { 
    environment?: string; 
    mood?: string; 
    description?: string;
    songSuggestions?: Array<{title: string, artist: string, genre: string}>;
  }) => void 
}) {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('screen');
  const [recordedContent, setRecordedContent] = useState<string | null>(null);

  // Check if Screenpipe is installed
  useEffect(() => {
    const checkScreenpipeInstallation = async () => {
      try {
        // In a real implementation, we would use the Screenpipe SDK to check
        // For demo purposes, we'll simulate this check
        const isScreenpipeAvailable = window.navigator.userAgent.includes('Screenpipe');
        setIsInstalled(isScreenpipeAvailable);
        
        if (!isScreenpipeAvailable) {
          console.log('Screenpipe not detected. Using fallback mode.');
        }
      } catch (error) {
        console.error('Error checking Screenpipe installation:', error);
        setIsInstalled(false);
      }
    };

    checkScreenpipeInstallation();
  }, []);

  // Simulate starting recording with Screenpipe
  const startRecording = async () => {
    try {
      setIsRecording(true);
      toast.success('Recording started with Screenpipe');
      
      // In a real implementation, we would use the Screenpipe SDK to start recording
      // For demo purposes, we'll simulate this
      
      // Simulate recording for 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  // Simulate stopping recording
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      toast.success('Recording stopped');
      
      // In a real implementation, we would use the Screenpipe SDK to stop recording
      // For demo purposes, we'll simulate getting some content
      
      if (activeTab === 'screen') {
        setRecordedContent('Screen recording captured. Ready for analysis.');
      } else {
        setRecordedContent('Audio recording captured. Ready for analysis.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    }
  };

  // Simulate analyzing content with Screenpipe
  const analyzeContent = async () => {
    if (!recordedContent) {
      toast.error('No content to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.info('Analyzing content with Screenpipe and AI...');
      
      // In a real implementation, we would use the Screenpipe SDK to analyze the content
      // For demo purposes, we'll simulate this with a timeout
      
      setTimeout(() => {
        setIsAnalyzing(false);
        
        // Simulate different results based on the active tab
        if (activeTab === 'screen') {
          // Simulate detecting a nature scene
          const analysisResult = {
            environment: 'forest',
            mood: 'peaceful',
            description: 'A serene forest environment with tall trees and natural sunlight filtering through the canopy',
            songSuggestions: [
              { title: 'Forest Whispers', artist: 'Nature Sounds', genre: 'Ambient' },
              { title: 'Woodland Serenity', artist: 'Eco Ensemble', genre: 'New Age' },
              { title: 'Pine Dreams', artist: 'Forest Collective', genre: 'Ambient' }
            ]
          };
          
          if (onContentAnalyzed) {
            onContentAnalyzed(analysisResult);
          }
          
          toast.success('Environment detected: Forest');
        } else {
          // Simulate detecting ambient sounds
          const analysisResult = {
            environment: 'ambient',
            mood: 'relaxing',
            description: 'Calm ambient sounds with a gentle background noise pattern',
            songSuggestions: [
              { title: 'Ambient Flow', artist: 'Sound Therapy', genre: 'Ambient' },
              { title: 'Peaceful Waves', artist: 'Relaxation Masters', genre: 'New Age' }
            ]
          };
          
          if (onContentAnalyzed) {
            onContentAnalyzed(analysisResult);
          }
          
          toast.success('Sound environment detected: Ambient');
        }
      }, 2000);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
      setIsAnalyzing(false);
    }
  };

  // Handle installation instructions
  const handleInstallClick = () => {
    window.open('https://screenpi.pe', '_blank');
  };

  return (
    <Card className="w-full bg-gray-900/90 backdrop-blur-lg border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-400" />
          Screenpipe Integration
        </CardTitle>
        <CardDescription>
          Capture and analyze your screen or audio to automatically generate matching soundscapes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isInstalled === false && (
          <Alert className="mb-4 border-amber-500 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Screenpipe Not Detected</AlertTitle>
            <AlertDescription>
              For the best experience, we recommend installing Screenpipe. This will enable advanced screen and audio analysis.
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-400 hover:text-amber-300"
                onClick={handleInstallClick}
              >
                Install Screenpipe
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="screen" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-4">
            <TabsTrigger value="screen" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Screen Capture</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Audio Capture</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="screen" className="space-y-4">
            <div className="bg-black/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] border border-gray-800">
              {isRecording ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Camera className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Recording your screen...</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={stopRecording}
                    className="mt-2"
                  >
                    Stop Recording
                  </Button>
                </div>
              ) : recordedContent ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-gray-300 mb-2">{recordedContent}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRecordedContent(null)}
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={analyzeContent}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Analyze Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Capture your screen to detect environment</p>
                  <p className="text-gray-500 text-sm mb-4">We'll analyze your screen to suggest matching soundscapes</p>
                  <Button 
                    variant="default" 
                    onClick={startRecording}
                    disabled={isRecording}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Screen Capture
                  </Button>
                </div>
              )}
            </div>
            
            <Alert className="border-blue-500 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>How It Works</AlertTitle>
              <AlertDescription>
                Screenpipe captures your screen and uses AI to detect environments, objects, and context. 
                This helps SoundScape AI generate perfectly matched audio environments.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <div className="bg-black/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] border border-gray-800">
              {isRecording ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Mic className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Recording audio...</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={stopRecording}
                    className="mt-2"
                  >
                    Stop Recording
                  </Button>
                </div>
              ) : recordedContent ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-gray-300 mb-2">{recordedContent}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRecordedContent(null)}
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={analyzeContent}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Analyze Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                    <Mic className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Capture ambient audio to detect environment</p>
                  <p className="text-gray-500 text-sm mb-4">We'll analyze surrounding sounds to suggest matching soundscapes</p>
                  <Button 
                    variant="default" 
                    onClick={startRecording}
                    disabled={isRecording}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Audio Capture
                  </Button>
                </div>
              )}
            </div>
            
            <Alert className="border-purple-500 bg-purple-500/10">
              <AlertCircle className="h-4 w-4 text-purple-500" />
              <AlertTitle>How It Works</AlertTitle>
              <AlertDescription>
                Screenpipe captures ambient audio and uses AI to analyze sound patterns, background noise, and acoustic properties.
                This helps SoundScape AI generate complementary audio environments.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          Powered by Screenpipe - 100% local, privacy-first screen and audio capture
        </p>
        <Button 
          variant="link" 
          className="p-0 h-auto text-blue-400 hover:text-blue-300"
          onClick={handleInstallClick}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
