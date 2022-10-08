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
  const [name, setName] = useState<string>('');
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

  return (
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
  );
};

export default AddRestaurantForm;
