import { Menu } from '@headlessui/react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { errorMonitor } from 'events';

export type RecordItem = {
  id: number;
  user_id?: string;
  restaurant_id: number;
  issued_at: string;
  amounts: number[];
};

const KebabIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
};

type ItemMenuProps = {
  onDelete: () => void;
  onEdit: () => void;
};

const ItemMenu: React.FC<ItemMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <Menu as="div" className="relative ">
      <Menu.Button>
        <KebabIcon />
      </Menu.Button>
      <Menu.Items className="absolute bg-gray-50 origin-top-right border-2 w-32 right-0 mt-1 z-10 rounded-md shadow-md">
        <div className="p-1">
          <Menu.Item>
            <button
              onClick={onEdit}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-200"
            >
              Edit
            </button>
          </Menu.Item>
          <Menu.Item>
            <button
              onClick={onDelete}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-200"
            >
              Delete
            </button>
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

const deleteRecord = async (recordId: number) => {
  const { error } = await supabaseClient
    .from('records')
    .delete()
    .eq('id', recordId);

  if (error) {
    throw new Error(error.message);
  }
};

const RecordViewItem: React.FC<RecordItem> = ({
  issued_at,
  amounts,
  id,
  restaurant_id,
}) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(deleteRecord, {
    onMutate: async (recordId: number) => {
      const previousRecords = queryClient.getQueryData<RecordItem[]>([
        'records',
        restaurant_id,
      ]);

      if (previousRecords) {
        let newRecords = previousRecords.filter((rec) => {
          return rec.id !== recordId;
        });

        queryClient.setQueryData<RecordItem[]>(
          ['records', restaurant_id],
          newRecords
        );
      }

      return { previousRecords };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        ['records', restaurant_id],
        context?.previousRecords
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(['records']);
    },
  });
  return (
    <div className="flex flex-col w-full border rounded-md p-2 mb-2 gap-1 last:mb-0">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {new Intl.DateTimeFormat('en-US').format(new Date(issued_at))}
        </p>
        <ItemMenu
          onEdit={() => console.log('edit')}
          onDelete={() => {
            mutate(id);
          }}
        />
      </div>
      <div className="flex justify-end">
        {amounts.length > 1 ? (
          <div className="flex flex-col">
            {amounts.map((a, index) => (
              <span className="text-right" key={`${id}-${index}`}>
                {a.toLocaleString()}
              </span>
            ))}
            <hr className="bg-black" />
            <span className="font-bold">
              {amounts.reduce((acc, curr) => acc + curr, 0).toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="font-bold">{amounts[0].toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};

export default RecordViewItem;
