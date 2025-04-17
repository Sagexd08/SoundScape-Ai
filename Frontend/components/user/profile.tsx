'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, any> | null;
}

export function UserProfileComponent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfile({
          ...data,
          preferences: typeof data.preferences === 'string' 
            ? JSON.parse(data.preferences)
            : data.preferences
        });
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar image must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setAvatarFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      let avatarUrl = profile.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        const filename = `${user.id}-${Date.now()}.${avatarFile.name.split('.').pop()}`;
        const filePath = `avatars/${filename}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, avatarFile);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
          
        avatarUrl = data.publicUrl;
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update profile state
      setProfile({
        ...profile,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl
      });
      
      setSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || !profile) {
    return (
      <Alert>
        <AlertDescription>
          You must be logged in to view your profile.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {(avatarPreview || profile.avatar_url) ? (
                <AvatarImage 
                  src={avatarPreview || profile.avatar_url || ''} 
                  alt={profile.display_name || 'User'} 
                />
              ) : (
                <AvatarFallback>
                  {getInitials(profile.display_name || profile.email)}
                </AvatarFallback>
              )}
            </Avatar>
            
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="bg-primary text-white rounded-full p-2 shadow-md">
                    <Upload className="h-4 w-4" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isSaving}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={profile.email}
            readOnly
            disabled
          />
        </div>
        
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            disabled={!isEditing || isSaving}
          />
        </div>
        
        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about yourself"
            disabled={!isEditing || isSaving}
            rows={4}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setDisplayName(profile.display_name || '');
                setBio(profile.bio || '');
                setAvatarFile(null);
                setAvatarPreview(null);
                setError(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}