import { supabaseClient, User } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Restaurant } from "../pages/restaurants";

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

const AddRestaurantForm = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [restaurantName, setRestaurantName] = useState<string>('');
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

    setRestaurantName('');
    console.log('submitted name: ', restaurantName);

    mutate({
      name: restaurantName,
      user,
    });
  };

  const isFormComplete = restaurantName !== undefined && restaurantName !== '';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-2 gap-2">
      <div className="flex flex-col">
        <label htmlFor="name">Name: </label>
        <input
          className="border border-black rounded-md p-2 w-full"
          type={'text'}
          id="name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
        />
      </div>
      <button
        disabled={!isFormComplete}
        className={`mt-2 flex justify-center items-center w-full p-3 border bg-cyan-600 text-white font-semibold text-lg rounded-md
          ${!isFormComplete && 'opacity-30'}
          `}
        type={'submit'}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};

export default AddRestaurantForm;
