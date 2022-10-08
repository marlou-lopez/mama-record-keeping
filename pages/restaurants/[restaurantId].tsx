import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import DateRangePicker, { DateRange } from '../../components/DateRangePicker';
import AddRecordForm from '../../components/AddRecordForm';
import { RecordItem } from '../../components/RecordViewItem';
import RecordViewItemList from '../../components/RecordViewItemList';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useQuery } from '@tanstack/react-query';
import { Restaurant } from '.';
import { NextPageWithLayout } from '../_app';
import Layout from '../../layout/layout';
import BottomFormDrawer from '../../components/BottomFormDrawer';
import toast from 'react-hot-toast';

type GetRecordsParams = {
  restaurantId: number | undefined;
  dateRange: DateRange;
};

const getRecords = async ({ restaurantId, dateRange }: GetRecordsParams) => {
  console.log(dateRange);
  if (!restaurantId) return;
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

  return data || [];
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
  const { data: restaurantInfo } = useQuery(
    ['restaurant', restaurantId],
    () => getRestaurant(restaurantId as string),
    {
      enabled: !!restaurantId,
    }
  );
  const {
    data: recordItems,
    isLoading,
    refetch,
    isRefetching,
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await toast.promise(refetch(), {
      loading: 'Generating records...',
      success: 'Records generated!',
      error: 'Something went wrong',
    });

    console.log('submitted: ', dateRangeValue);
  };
  const handleClear = async () => {
    setDateRangeValue([undefined, undefined]);
    // To create a new date range instance, instead of updating the existing.
    // Reasoning: DateRangePicker is uncontrolled.
    setDateRangeKey(nanoid());

    // await toast.promise(
    //   refetch(),
    //   {
    //     loading: 'Resetting records...',
    //     success: 'All records are displayed!',
    //     error: 'Something went wrong'
    //   }
    // )
  };

  const handleShowDatePicker = () => {
    setShowDatePicker((curr) => !curr);
  };

  const isDateRangeComplete =
    dateRangeValue[0] !== undefined &&
    dateRangeValue[0] !== '' &&
    dateRangeValue[1] !== undefined &&
    dateRangeValue[1] !== '';

  useEffect(() => {
    if (!isDateRangeComplete) {
      toast.promise(refetch(), {
        loading: 'Resetting records...',
        success: 'All records are displayed!',
        error: 'Something went wrong',
      });
    }
  }, [isDateRangeComplete, refetch]);

  // if (isRefetching ) {
  //   toast.loading('Generating records...');
  // }
  return (
    <>
      <div className="flex w-full fixed top-16 z-10">
        <div className="flex flex-col px-4 pt-6 pb-4 mx-auto w-full md:max-w-xl bg-gray-50 border-b-2">
          <div className="flex justify-between items-center bg-gray-50 py-2">
            <h1 className="text-3xl">{restaurantInfo?.name}</h1>
            <div className="flex items-center gap-1">
              <input
                type={'checkbox'}
                id="showDatePicker"
                onChange={handleShowDatePicker}
                checked={showDatePicker}
              />
              <label htmlFor="showDatePicker">Select Date</label>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col z-10 border-gray-50 gap-2 transition-all duration-300 ease-in-out overflow-hidden
            ${showDatePicker ? 'max-h-72' : 'max-h-0 invisible'}
            `}
          >
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
                  ? 'mt-52'
                  : 'mt-24'
                : 'mt-0'
            }
          `}
      >
        {!isLoading && <RecordViewItemList items={recordItems} />}
      </div>
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
