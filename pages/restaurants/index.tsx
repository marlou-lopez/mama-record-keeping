import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Router from 'next/router';
import { NextPage } from 'next/types';
import { useEffect, useState } from 'react';
import BigMenuLink from '../../components/BigMenuLink';
import Layout from '../../layout/layout';
import { NextPageWithLayout } from '../_app';

export type Restaurant = {
  id: number;
  name: string;
  user_id?: string;
  created_at?: string;
};

const fetchRestaurants = async () => {
  const { data, error } = await supabaseClient
    .from<Restaurant>('restaurants')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const addRestaurant = async ({
  name,
  user,
}: {
  name: Restaurant['name'];
  user: User | null;
}) => {
  // console.log(user);
  const { error } = await supabaseClient
    .from('restaurants')
    .insert({ name, user_id: user?.id })
    .single();
  if (error) {
    throw new Error(error.message);
  }
};

const Restaurants: NextPageWithLayout = () => {
  // const [restaurants, setRestaurants] = useState<Restaurant[] | null>([]);
  // const { user, signOut } = useAuth();
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const { data } = useQuery(['restaurants'], () => fetchRestaurants());
  const { mutate } = useMutation(addRestaurant, {
    onMutate: async ({ name: newRestaurant, user }) => {
      await queryClient.cancelQueries(['restaurants']);
      const previousRestaurants = queryClient.getQueryData<Restaurant[]>([
        'restaurants',
      ]);
      if (previousRestaurants) {
        queryClient.setQueryData<Restaurant[]>(
          ['restaurants'],
          [
            ...(previousRestaurants || []),
            {
              id: Math.random(),
              name: newRestaurant,
              user_id: user?.id,
            },
          ]
        );
      }

      return { previousRestaurants };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(['restaurants'], context?.previousRestaurants);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['restaurants']);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setName('');
    console.log('submitted name: ', name);

    mutate({
      name,
      user,
    });
  };

  // const handleSignout = async () => {
  //   await supabaseClient.auth.signOut();
  // };

  // useEffect(() => {
  //   if (!user && !isLoading) {
  //     console.log("pumasok");
  //     Router.push('/');
  //   }
  // }, [user, isLoading]);

  return (
    <>
      {/* <div className="p-4 z-10 border-b flex items-center justify-between"> */}
      {/*   <Link href="/"> */}
      {/*     <a>Back</a> */}
      {/*   </Link> */}
      {/*   <button className="p-2 border-2" onClick={handleSignout}> */}
      {/*     Logout */}
      {/*   </button> */}
      {/* </div> */}
      <div className="flex flex-col items-center flex-grow">
        {data &&
          data.length > 0 &&
          data.map((restaurant) => {
            return (
              <Link href={`restaurants/${restaurant.id}`} key={restaurant.id} passHref>
                <BigMenuLink size="medium">{restaurant.name}</BigMenuLink>
              </Link>
            );
          })}
      </div>
      <div className="fixed bottom-0 w-full">
        <div className="border-t-2 p-2 flex justify-center">
          {showForm ? (
            <div className="flex flex-col">
              <button
                className="uppercase font-semibold text-xs p-2"
                onClick={() => setShowForm(false)}
              >
                Close
              </button>
              <form onSubmit={handleSubmit} className="flex flex-col p-2 gap-2">
                <div className="flex flex-col">
                  <label htmlFor="name">Name: </label>
                  <input
                    className="p-2 rounded border"
                    type={'text'}
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <button
                  className="p-2 bg-black text-white"
                  type={'submit'}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </form>
            </div>
          ) : (
            <button
              className="uppercase font-semibold p-2"
              onClick={() => setShowForm(true)}
            >
              Add Restaurant
            </button>
          )}
        </div>
      </div>
    </>
  );
};

Restaurants.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Restaurants;
