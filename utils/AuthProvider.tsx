import { User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import exp from 'constants';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

type SupabaseAuthPayload = {
  email: string;
};

type AuthContextProps = {
  user: User | null;
  signIn: (payload: SupabaseAuthPayload) => void;
  signOut: () => void;
  loggedIn: boolean;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const signIn = async (payload: SupabaseAuthPayload) => {
    console.log('payload: ', payload);
    try {
      const { error } = await supabase.auth.signIn(payload);

      if (error) {
        console.error(error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const user = supabase.auth.user();
    console.log('asdasdd: ', user);

    if (user) {
      setUser(user);
      setLoggedIn(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        if (user) {
          setUser(user);
          setLoggedIn(true);
        } else {
          console.log('pumasok');
          setUser(null);
          router.push('/');
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        user,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { AuthProvider, useAuth };
