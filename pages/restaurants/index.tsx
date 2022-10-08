import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import AddRestaurantForm from '../../components/AddRestaurantForm';
import BigMenuLink from '../../components/BigMenuLink';
import BottomFormDrawer from '../../components/BottomFormDrawer';
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


const Restaurants: NextPageWithLayout = () => {
  const { user, isLoading } = useUser();
  const { data } = useQuery(['restaurants'], () => fetchRestaurants(), {
    enabled: !!user && !isLoading
  });

  return (
    <>
      <div className="flex flex-col items-center flex-grow">
        {data &&
          data.length > 0 &&
          data.map((restaurant) => {
            return (
              <Link
                href={`restaurants/${restaurant.id}`}
                key={restaurant.id}
                passHref
              >
                <BigMenuLink size="medium">{restaurant.name}</BigMenuLink>
              </Link>
            );
          })}
      </div>
      <BottomFormDrawer openText='Add Restaurant'>
       <AddRestaurantForm /> 
      </BottomFormDrawer>
    </>
  );
};

Restaurants.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Restaurants;
