'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { aiService } from '@/lib/ai-integration';

interface RealTimeAdapterProps {
  onClose: () => void;
}

export default function RealTimeAdapter({
  onClose
}: RealTimeAdapterProps) {
  const [isActive, setIsActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [detectedEnvironment, setDetectedEnvironment] = useState<string | null>(null);
  const [adaptationSpeed, setAdaptationSpeed] = useState(50);
  const [sensitivityLevel, setSensitivityLevel] = useState(70);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const [analysisInterval, setAnalysisInterval] = useState(5000); // 5 seconds

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera when active
  useEffect(() => {
    if (isCameraActive && isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
      }
    };
  }, [isCameraActive, isActive]);

  // Set up continuous analysis when active
  useEffect(() => {
    if (isActive && isCameraActive) {
      // Start continuous analysis
      analysisTimerRef.current = setInterval(() => {
        // Only analyze if enough time has passed since last analysis
        const now = Date.now();
        if (now - lastAnalysisTime >= analysisInterval) {
          captureAndAnalyze();
          setLastAnalysisTime(now);
        }
      }, 1000); // Check every second
    } else {
      // Clear interval when not active
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
      }
    }

    return () => {
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
      }
    };
  }, [isActive, isCameraActive, lastAnalysisTime, analysisInterval]);

  // Update analysis interval based on adaptation speed
  useEffect(() => {
    // Map adaptation speed (0-100) to interval (10000ms - 1000ms)
    // Higher speed = lower interval
    const newInterval = 10000 - (adaptationSpeed * 90);
    setAnalysisInterval(newInterval);
  }, [adaptationSpeed]);

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
      setIsActive(false);
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

  // Capture and analyze image from camera
  const captureAndAnalyze = () => {
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
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Lower quality for faster processing

        // Process the captured image
        processImage(imageDataUrl);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image or video
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Please upload an image or video file');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }

      setUploadedMedia(file);

      // If it's an image, process it
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          processImage(imageDataUrl);
        };
        reader.readAsDataURL(file);
      } else {
        // For video, we'd need a more complex solution
        toast.info('Video analysis is not yet supported. Please upload an image.');
      }
    }
  };

  // Process image with Gemini AI
  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);

    try {
      // Call Gemini AI to analyze the image
      const result = await aiService.analyzeEnvironmentImage(imageDataUrl);

      if (result && result.environment) {
        // Extract environment
        const { environment } = result;

        // Update detected environment
        setDetectedEnvironment(environment);

        // Show toast only on environment change
        if (environment !== detectedEnvironment) {
          toast.success(`Environment changed: ${environment}`);
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Don't show error toast for continuous analysis to avoid spam
      if (!isCameraActive || !isActive) {
        toast.error('Failed to analyze image. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle real-time adaptation
  const toggleRealTimeAdaptation = () => {
    const newState = !isActive;
    setIsActive(newState);

    if (newState) {
      toast.success('Real-time adaptation activated');
      // Start camera if not already active
      if (!isCameraActive) {
        setIsCameraActive(true);
      }
    } else {
      toast.info('Real-time adaptation deactivated');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-gray-900/95 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              Real-Time Adaptation
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
            Continuously analyze your surroundings and adapt audio in real-time
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="real-time-toggle" className="text-base font-medium">
                Real-Time Adaptation
              </Label>
              <p className="text-sm text-gray-400">
                Continuously analyze and adapt to your environment
              </p>
            </div>
            <Switch
              id="real-time-toggle"
              checked={isActive}
              onCheckedChange={toggleRealTimeAdaptation}
            />
          </div>

          {isActive && (
            <div className="space-y-6 pt-4 border-t border-gray-800">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="adaptation-speed" className="text-sm">
                    Adaptation Speed
                  </Label>
                  <span className="text-xs text-gray-400">
                    {adaptationSpeed < 30 ? 'Slow' : adaptationSpeed < 70 ? 'Medium' : 'Fast'}
                  </span>
                </div>
                <Slider
                  id="adaptation-speed"
                  value={[adaptationSpeed]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setAdaptationSpeed(value[0])}
                  className="my-2"
                />
                <p className="text-xs text-gray-500">
                  Controls how quickly the audio adapts to changes in your environment
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sensitivity-level" className="text-sm">
                    Sensitivity Level
                  </Label>
                  <span className="text-xs text-gray-400">
                    {sensitivityLevel < 30 ? 'Low' : sensitivityLevel < 70 ? 'Medium' : 'High'}
                  </span>
                </div>
                <Slider
                  id="sensitivity-level"
                  value={[sensitivityLevel]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setSensitivityLevel(value[0])}
                  className="my-2"
                />
                <p className="text-xs text-gray-500">
                  Determines how sensitive the system is to subtle changes in your environment
                </p>
              </div>

              <div className="relative aspect-video bg-gray-950 rounded-lg overflow-hidden">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-700 mb-2" />
                    <p className="text-gray-500 text-center">
                      Camera is inactive
                      <br />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCameraActive(true)}
                        className="mt-2"
                      >
                        Activate Camera
                      </Button>
                    </p>
                  </div>
                )}

                {/* Environment indicator */}
                {detectedEnvironment && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white">
                    <span className="capitalize">{detectedEnvironment}</span>
                  </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                    <Loader2 className="h-3 w-3 text-indigo-400 animate-spin mr-1" />
                    <span className="text-xs text-white">Analyzing</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className="border-gray-700"
                >
                  {isCameraActive ? 'Disable Camera' : 'Enable Camera'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-gray-800 pt-4">
          <div className="flex justify-between w-full mb-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-400 hover:text-white"
            >
              Back to AI Studio
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Real-Time Adaptation uses your device's camera to continuously analyze your surroundings and dynamically adjust the audio.
            The audio will seamlessly transition as your environment changes, providing an immersive experience.
          </p>
        </CardFooter>
      </Card>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
