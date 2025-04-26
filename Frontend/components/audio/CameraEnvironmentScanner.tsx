'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { aiService } from '@/lib/ai-integration';

interface CameraEnvironmentScannerProps {
  onEnvironmentDetected: (
    environment: string,
    additionalData?: {
      description?: string;
      mood?: string;
      songSuggestions?: Array<{title: string, artist: string, genre: string}>;
    }
  ) => void;
  onClose: () => void;
}

export default function CameraEnvironmentScanner({
  onEnvironmentDetected,
  onClose
}: CameraEnvironmentScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        setIsCameraActive(false);
        
        // Process the captured image
        processImage(imageDataUrl);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      setUploadedImage(file);
      
      // Create a data URL from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        
        // Process the uploaded image
        processImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with Gemini AI
  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      toast.info('Analyzing environment with Gemini AI...');
      
      // Call Gemini AI to analyze the image
      const result = await aiService.analyzeEnvironmentImage(imageDataUrl);
      
      if (result && result.environment) {
        // Extract environment and additional data
        const { environment, description, mood, songSuggestions } = result;
        
        // Pass the detected environment and additional data to the parent component
        onEnvironmentDetected(environment, {
          description,
          mood,
          songSuggestions
        });
        
        toast.success(`Environment detected: ${environment}`);
        onClose();
      } else {
        toast.error('Could not detect environment. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
      
      // Fallback to predefined environments
      const environments = ['forest', 'ocean', 'city', 'cafe', 'mountains', 'rain'];
      const randomEnvironment = environments[Math.floor(Math.random() * environments.length)];
      
      onEnvironmentDetected(randomEnvironment);
      toast.info(`Using fallback environment: ${randomEnvironment}`);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-gray-900/95 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-400" />
              Environment Scanner
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Scan your surroundings or upload an image to detect the environment and generate matching audio
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-300 text-center">
                Analyzing environment with Gemini AI...
                <br />
                <span className="text-sm text-gray-500">This may take a few moments</span>
              </p>
            </div>
          ) : capturedImage ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-950 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured environment"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedImage(null);
                    setUploadedImage(null);
                  }}
                >
                  Take Another
                </Button>
                
                <Button
                  onClick={() => {
                    if (capturedImage) {
                      processImage(capturedImage);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Use This Image
                </Button>
              </div>
            </div>
          ) : isCameraActive ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-950 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsCameraActive(false)}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={captureImage}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Capture
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setIsCameraActive(true)}
                className="h-32 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 p-4"
              >
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Use Camera</span>
                <span className="text-xs text-gray-400">Scan your surroundings</span>
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-32 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 p-4"
              >
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Upload Image</span>
                <span className="text-xs text-gray-400">From your device</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500">
            The environment scanner uses Gemini AI to analyze your surroundings and detect the environment type.
            This helps generate more accurate and immersive audio that matches your location.
          </p>
        </CardFooter>
      </Card>
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
