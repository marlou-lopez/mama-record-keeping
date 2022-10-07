import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import BigMenuLink from '../components/BigMenuLink';

const Home: NextPage = () => {
  const [email, setEmail] = useState<string>('');
  const { user } = useUser();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error } = await supabaseClient.auth.signIn({ email });

    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col items-center justify-center h-screen w-screen">
      {user ? (
        <>
          <Link href="/restaurants" passHref>
            <BigMenuLink>View Records</BigMenuLink>
          </Link>
          <Link href="/print">
            <BigMenuLink>Print Records</BigMenuLink>
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="email">Email:</label>
          <input
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            className="p-2 rounded border-2"
          />
          <button onClick={handleSubmit}>Submit</button>
        </form>
      )}
    </div>
  );
};

export default Home;
