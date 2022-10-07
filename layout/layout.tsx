import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useEffect } from 'react';

type LayoutType = { children: React.ReactNode };

const Layout = ({ children }: LayoutType) => {
  const { user, isLoading } = useUser();

  const handleSignout = async () => {
    await supabaseClient.auth.signOut();
  };

  useEffect(() => {
    if (!user && !isLoading) {
      console.log('pumasok');
      Router.push('/');
    }
  }, [user, isLoading]);

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <div className="p-4 z-10 border-b flex items-center justify-between">
        <button onClick={() => Router.back()}>Back</button>
        <button className="p-2 border-2" onClick={handleSignout}>
          Logout
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
