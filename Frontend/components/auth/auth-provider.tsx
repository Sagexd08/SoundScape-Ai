'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        isLoading: false,
        error
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          error: null,
          isLoading: false
        }));

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            // Redirect to home page after sign in
            router.push('/');
            break;
          case 'SIGNED_OUT':
            // Redirect to home page after sign out
            router.push('/');
            break;
          case 'USER_UPDATED':
            // Refresh user metadata
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        session: data.session,
        user: data.user,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error signing in:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        session: data.session,
        user: data.user,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        session: null,
        user: null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error resetting password:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error updating password:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // No need to update state here as the redirect will happen
      // and the auth state will be updated when the user returns
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError,
        isLoading: false
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}