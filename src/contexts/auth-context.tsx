'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Supabase client'ını memoize et
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    // Mevcut kullanıcıyı al
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.warn('Auth error:', error.message);
          // Refresh token hatası durumunda session'ı temizle
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token')) {
            console.log('Clearing invalid session...');
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Auth durumu değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Hata olsa bile kullanıcıyı null yap
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Production'da her zaman Vercel URL'ini kullan
      const isProduction = typeof window !== 'undefined' && 
                          window.location.hostname !== 'localhost';
      
      const redirectUrl = isProduction 
        ? 'https://animetpdf.vercel.app'
        : 'http://localhost:3000';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/auth/callback?next=/profil`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
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
