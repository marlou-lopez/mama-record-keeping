import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import DateRangePicker, {
  DateRange,
} from '../../../components/DateRangePicker';
import AddRecordForm from '../../../components/AddRecordForm';
import { RecordItem } from '../../../components/RecordViewItem';
import RecordViewItemList from '../../../components/RecordViewItemList';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useQuery } from '@tanstack/react-query';
import { NextPageWithLayout } from '../../_app';
import Layout from '../../../layout/layout';
import BottomFormDrawer from '../../../components/BottomFormDrawer';
import toast from 'react-hot-toast';
import { Restaurant } from '..';
import { Dialog } from '@headlessui/react';
import PrintRestaurantRecord from '../../../components/PrintRestaurantRecord';

type GetRecordsParams = {
  restaurantId: number | undefined;
  dateRange: DateRange;
};

const getRecords = async ({ restaurantId, dateRange }: GetRecordsParams) => {
  if (!restaurantId) return [];
  let query = supabaseClient
    .from<RecordItem>('records')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (dateRange[0] && dateRange[1]) {
    query = query.lte('issued_at', dateRange[1]).gte('issued_at', dateRange[0]);
  }
  query = query.order('issued_at', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getRestaurant = async (restaurantId: string | undefined) => {
  if (!restaurantId) return;
  const { data, error } = await supabaseClient
    .from<Restaurant>('restaurants')
    .select('id, name')
    .eq('id', restaurantId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const RecordView: NextPageWithLayout = () => {
  const router = useRouter();
  const { restaurantId } = router.query;
  const [dateRangeValue, setDateRangeValue] = useState<DateRange>([
    undefined,
    undefined,
  ]);
  const { data: restaurantInfo, isLoading: isGettingRestaurantInfo } = useQuery(
    ['restaurant', restaurantId],
    () => getRestaurant(restaurantId as string),
    {
      enabled: !!restaurantId && router.isReady,
    }
  );
  const {
    data: recordItems,
    isLoading: isLoadingRecords,
    refetch,
  } = useQuery(
    ['records', restaurantInfo?.id],
    () =>
      getRecords({
        restaurantId: restaurantInfo?.id,
        dateRange: dateRangeValue,
      }),
    {
      enabled: !!restaurantInfo,
    }
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateKey, setDateRangeKey] = useState<string>(nanoid());

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await toast.promise(refetch(), {
      loading: 'Generating records...',
      success: 'Records generated!',
      error: 'Something went wrong',
    });
  };
  const handleClear = async () => {
    setDateRangeValue([undefined, undefined]);
    // To create a new date range instance, instead of updating the existing.
    // Reasoning: DateRangePicker is uncontrolled.
    setDateRangeKey(nanoid());
  };

  const handleShowDatePicker = () => {
    setShowDatePicker((curr) => !curr);
  };

  const isDateRangeComplete =
    dateRangeValue[0] !== undefined &&
    dateRangeValue[0] !== '' &&
    dateRangeValue[1] !== undefined &&
    dateRangeValue[1] !== '';

  // Need to find better way
  useEffect(() => {
    async function refetchRecords() {
      toast.promise(refetch(), {
        loading: 'Resetting records...',
        success: 'All records are displayed!',
        error: 'Something went wrong',
      });
    }
    if (!isDateRangeComplete) {
      refetchRecords();
    }

    return () => {
      console.log('awgagw');
    };
  }, [isDateRangeComplete, refetch]);

  return (
    <>
      <div className="flex w-full fixed top-16 z-10">
        <div className="flex flex-col px-4 pt-6 pb-4 mx-auto w-full md:max-w-xl bg-gray-50 border-b-2">
          <div className="flex justify-between items-center bg-gray-50 py-2">
            <h1 className="text-3xl">{restaurantInfo?.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type={'checkbox'}
                  id="showDatePicker"
                  onChange={handleShowDatePicker}
                  checked={showDatePicker}
                />
                <label htmlFor="showDatePicker">Select Date</label>
              </div>
              <button
                onClick={() => setOpenDialog(true)}
                className="p-2 border rounded uppercase font-semibold bg-cyan-600 text-white"
              >
                Print
              </button>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col z-10 border-gray-50 gap-2 transition-all duration-300 ease-in-out overflow-hidden
            ${showDatePicker ? 'max-h-72' : 'max-h-0 invisible'}
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
      </div>
      <div
        className={`flex flex-col px-4 pt-16 pb-32 mx-auto w-full md:max-w-xl
          transition-all duration-300 ease-in-out
            ${
              showDatePicker
                ? isDateRangeComplete
                  ? 'mt-64'
                  : 'mt-36'
                : 'mt-14'
            }
          `}
      >
        {!isLoadingRecords && <RecordViewItemList items={recordItems} />}
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
                <p className='text-3xl uppercase font-bold'>Printing: {restaurantInfo?.name}</p>
                <button className='border py-2 px-4' type="button" onClick={() => setOpenDialog(false)}>
                  Close
                </button>
              </Dialog.Title>
              <div className="flex flex-grow">
                <PrintRestaurantRecord
                  data={recordItems || []}
                  name={restaurantInfo?.name}
                />
              </div>
              <div className="flex justify-end">
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <BottomFormDrawer openText="Add Record">
        <AddRecordForm restaurantId={Number(restaurantId)} />
      </BottomFormDrawer>
    </>
  );
};

RecordView.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default RecordView;
