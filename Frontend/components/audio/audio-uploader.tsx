'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Music, CheckCircle2 } from 'lucide-react';
import { uploadAudioWithMetadata } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';

interface AudioUploaderProps {
  onUploadComplete?: (data: any) => void;
  maxSizeMB?: number;
}

export function AudioUploader({ 
  onUploadComplete, 
  maxSizeMB = 10 
}: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }
      
      // Check file type
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Auto-fill title from filename if empty
      if (!title) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTitle(filename);
      }
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setIsPublic(false);
    setTags('');
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to upload audio');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Simulate upload progress (actual progress not available with Supabase SDK)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      // Process tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Upload the file
      const result = await uploadAudioWithMetadata(file, {
        title,
        description,
        isPublic,
        tags: tagArray
      });
      
      // Complete progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      // Reset form after a delay
      setTimeout(() => {
        resetForm();
      }, 3000);
      
    } catch (err) {
      setError((err as Error).message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Audio</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Audio uploaded successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Click or drag to upload an audio file</p>
              <p className="text-xs text-gray-500">MP3, WAV, FLAC up to {maxSizeMB}MB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Music className="h-10 w-10 text-gray-500 mr-4" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Change
              </Button>
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your audio"
              required
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your audio..."
              rows={3}
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ambient, nature, relax"
              disabled={isUploading}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isUploading}
            />
            <Label htmlFor="is-public">Make this audio public</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isUploading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : 'Upload Audio'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}