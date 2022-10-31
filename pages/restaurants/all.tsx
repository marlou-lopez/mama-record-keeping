import { Dialog } from '@headlessui/react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DateRangePicker, { DateRange } from '../../components/DateRangePicker';
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

type FetchAllRecordsParams = {
  dateRange: DateRange;
};

const fetchAllRecords = async ({ dateRange }: FetchAllRecordsParams) => {
  // const { data, error } = await supabaseClient
  let query = supabaseClient.from<FullRecordItemDetails>('records').select(
    `
      issued_at,
      id,
      amounts,
      restaurantInfo:restaurants(name)
    `
  );
  if (dateRange[0] && dateRange[1]) {
    query = query.lte('issued_at', dateRange[1]).gte('issued_at', dateRange[0]);
  }

  query = query.order('issued_at', { ascending: true });

  const { data, error } = await query;
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
// TODO: Create separate component for the date form. Also fix it
const All: NextPageWithLayout = () => {
  const { user, isLoading } = useUser();
  const [dateRangeValue, setDateRangeValue] = useState<DateRange>([
    undefined,
    undefined,
  ]);
  const [dateKey, setDateRangeKey] = useState<string>(nanoid());

  const { data, refetch } = useQuery(
    ['records'],
    () => fetchAllRecords({ dateRange: dateRangeValue }),
    {
      enabled: !!user && !isLoading,
    }
  );

  const [openDialog, setOpenDialog] = useState(false);

  if (!data) {
    return <div>no data</div>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await toast.promise(refetch(), {
      loading: 'Generating records...',
      success: 'Records generated!',
      error: 'Something went wrong',
    });
    console.log('test: ', dateRangeValue);
  };

  const handleClear = async () => {
    setDateRangeValue([undefined, undefined]);
    // To create a new date range instance, instead of updating the existing.
    // Reasoning: DateRangePicker is uncontrolled.
    setDateRangeKey(nanoid());
  };

  const isDateRangeComplete =
    dateRangeValue[0] !== undefined &&
    dateRangeValue[0] !== '' &&
    dateRangeValue[1] !== undefined &&
    dateRangeValue[1] !== '';

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
        <form
          onSubmit={handleSubmit}
          className={`flex flex-col z-10 border-gray-50 gap-2 transition-all duration-300 ease-in-out overflow-hidden
            `}
        >
          {/* Change Approach for this form */}
          <DateRangePicker
            key={dateKey}
            value={dateRangeValue}
            onChange={(date) => {
              setDateRangeValue(date);
            }}
          />
          {isDateRangeComplete && (
            <div className="flex flex-col gap-1">
              <button
                type={'submit'}
                disabled={!isDateRangeComplete}
                className="flex justify-center items-center w-full p-3 border bg-cyan-600 text-white font-semibold text-lg rounded-md"
              >
                Generate Records
              </button>
              <button
                type={'button'}
                disabled={!isDateRangeComplete}
                className={`border border-gray-400 rounded-md p-2 font-semibold`}
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          )}
        </form>
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
