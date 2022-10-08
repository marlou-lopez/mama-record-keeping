import { useRouter } from 'next/router';
import React, { useState } from 'react';
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
  const [openBottomDrawer, setOpenBottomDrawer] = useState<boolean>(false);

  const [dateRangeValue, setDateRangeValue] = useState<DateRange>([
    undefined,
    new Date().toLocaleDateString('en-CA'),
  ]);

  const [dateKey, setDateRangeKey] = useState<string>(nanoid());
  const [formKey, setFormKey] = useState<string>(nanoid());

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
      <div className="flex w-full fixed top-16">
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
            className={`flex flex-col gap-2 transition-all duration-500 ease-in-out overflow-hidden
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
            {!isStartDateEmpty && (
              <div className="flex flex-col gap-1">
                <button
                  type={'submit'}
                  disabled={isStartDateEmpty}
                  className="flex justify-center items-center w-full p-3 border bg-cyan-600 text-white font-semibold text-lg rounded-md"
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
        </div>
      </div>
      <div
        className={`flex flex-col px-4 pt-16 pb-32 mx-auto w-full md:max-w-xl`}
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
