import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import DateRangePicker, {
  DateRange,
  DateRangeHandle,
} from '../../components/DateRangePicker';
import AddRecordForm from '../../components/AddRecordForm';
import { RecordItem } from '../../components/RecordViewItem';
import RecordViewItemList from '../../components/RecordViewItemList';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useQuery } from '@tanstack/react-query';
import { Restaurant } from '.';
import { NextPageWithLayout } from '../_app';
import Layout from '../../layout/layout';

const getRecords = async (restaurantId: number | undefined) => {
  if (!restaurantId) return;
  const { data, error } = await supabaseClient
    .from<RecordItem>('records')
    .select('*')
    .eq('restaurant_id', restaurantId);

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
  const { data: restaurantInfo } = useQuery(
    ['restaurant', restaurantId],
    () => getRestaurant(restaurantId as string),
    {
      enabled: !!restaurantId,
    }
  );
  const { data: recordItems, isLoading } = useQuery(
    ['records', restaurantInfo?.id],
    () => getRecords(restaurantInfo?.id),
    {
      enabled: !!restaurantInfo,
    }
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const [dateRangeValue, setDateRangeValue] = useState<DateRange>([
    undefined,
    new Date().toLocaleDateString('en-CA'),
  ]);

  const [dateKey, setDateRangeKey] = useState<string>(nanoid());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log('submitted: ', dateRangeValue);
  };
  const handleClear = () => {
    setDateRangeValue((currentDateRange) => [undefined, currentDateRange[1]]);

    // To create a new date range instance, instead of updating the existing.
    // Reasoning: DateRangePicker is uncontrolled.
    setDateRangeKey(nanoid());
  };

  const handleShowDatePicker = () => {
    setShowDatePicker((curr) => !curr);
  };

  const isStartDateEmpty =
    dateRangeValue[0] === undefined || dateRangeValue[0] === '';

  return (
    <>
      <div className="flex w-full fixed">
        <div className="flex flex-col p-4 mx-auto  w-full md:max-w-xl bg-gray-50 border-b-2">
          <div className="flex justify-between items-center">
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
          {showDatePicker && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <DateRangePicker
                key={dateKey}
                value={dateRangeValue}
                onChange={(date) => {
                  setDateRangeValue(date);
                }}
              />
              {!isStartDateEmpty && (
                <div className="flex flex-col gap-1">
                  <button
                    type={'submit'}
                    disabled={isStartDateEmpty}
                    className="flex justify-center items-center w-full p-3 border bg-blue-600 text-white font-semibold text-lg rounded-md"
                  >
                    Generate Records
                  </button>
                  <button
                    type={'button'}
                    disabled={isStartDateEmpty}
                    className={`border border-gray-400 rounded-md p-2 font-semibold`}
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      <div
        className={`flex flex-col p-4 mx-auto w-full md:max-w-xl ${
          showDatePicker ? 'mt-40' : 'mt-20'
        }
          ${!isStartDateEmpty && 'mt-[336px]'}
        `}
      >
        {!isLoading && <RecordViewItemList items={recordItems} />}
      </div>
      <div className="fixed bottom-0 w-full">
        <div
          className={`bg-gray-50 border-t-2 p-4 flex justify-center transition-[height] duration-500 ease-in-out ${
            showForm ? 'h-96' : 'h-16'
          }`}
        >
          {!showForm && (
            <button
              type={'button'}
              onClick={() => {
                setShowForm(true);
              }}
            >
              Add Record
            </button>
          )}
          {showForm && (
            <div className="flex flex-col gap-2 w-full sm:w-72">
              <button
                className="uppercase text-xs p-2 font-semibold text-gray-500"
                type={'button'}
                onClick={() => setShowForm(false)}
              >
                Close
              </button>
              <AddRecordForm restaurantId={Number(restaurantId)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

RecordView.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default RecordView;
