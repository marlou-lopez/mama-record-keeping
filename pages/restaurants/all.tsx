import { Dialog } from '@headlessui/react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import PrintRecords from '../../components/PrintRecords/PrintRecords';
import { RecordItem } from '../../components/RecordViewItem';
import Layout from '../../layout/layout';
import { NextPageWithLayout } from '../_app';

export interface FullRecordItemDetails
  extends Omit<RecordItem, 'restaurant_id'> {
  restaurantInfo: {
    name: string;
  };
}

const fetchAllRecords = async () => {
  const { data, error } = await supabaseClient
    .from<FullRecordItemDetails>('records')
    .select(
      `
      issued_at,
      id,
      amounts,
      restaurantInfo:restaurants(name)
    `
    )
    .order('issued_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const formattedRecords = data.reduce<Record<string, FullRecordItemDetails[]>>(
    (acc, cur) => {
      const existingValue = acc[cur.issued_at] ?? [];
      acc[cur.issued_at] = [...existingValue, cur];
      return acc;
    },
    {}
  );
  return formattedRecords;
};

const All: NextPageWithLayout = () => {
  const { user, isLoading } = useUser();
  const { data } = useQuery(['records'], () => fetchAllRecords(), {
    enabled: !!user && !isLoading,
  });

  const [openDialog, setOpenDialog] = useState(false);

  if (!data) {
    return <div>no data</div>;
  }

  return (
    <div>
      <div className="fixed w-full top-16 bg-gray-300">
        <div className="px-8 py-2 bg-blue-100 flex justify-end">
          <button
            onClick={() => setOpenDialog(true)}
            className="border bg-black rounded-md text-white font-semibold py-2 px-4"
          >
            Print
          </button>
        </div>
      </div>
      <div className="sm:max-w-2xl mx-auto mt-16">
        {Object.entries(data).map(([key, value]) => {
          return (
            <div key={key} className="p-4 flex items-start border-2 gap-3">
              <div className="sm:w-40 w-32">
                <p>{new Date(key).toDateString()}</p>
              </div>
              <div className="flex-grow">
                {value.map((record) => {
                  const totalAmount = record.amounts.reduce(
                    (acc, cur) => acc + cur,
                    0
                  );
                  return (
                    <div key={record.id} className="flex justify-between">
                      <div>{record.restaurantInfo.name}</div>
                      <div>{totalAmount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Dialog
        className="z-50 relative"
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <div className="z-10 fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-gray-50 w-full h-full p-8 flex flex-col flex-grow">
            <div className="flex flex-col h-full gap-3">
              <Dialog.Title className="flex justify-between items-center">
                <p className="text-3xl uppercase font-bold">
                  {/* Replace when restaurant selection is available */}
                  Printing: All Records
                </p>
                <button
                  className="border py-2 px-4"
                  type="button"
                  onClick={() => setOpenDialog(false)}
                >
                  Close
                </button>
              </Dialog.Title>
              <div className="flex flex-grow">
                <PrintRecords data={data} />
              </div>
              <div className="flex justify-end"></div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

All.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default All;
