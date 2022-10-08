import { supabaseClient, User } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import React, { useContext, useState } from 'react';
import AmountInputForm from './AmountInputForm';
import { bottomFormDrawerContext, useBottomFormDrawer } from './BottomFormDrawer';
import { RecordItem } from './RecordViewItem';

type AmountValueType = {
  id: string;
  value: number;
};

type AddRecordFormProps = {
  restaurantId: number;
  onAdd?: () => void;
};

const addRecord = async (newRecord: RecordItem) => {
  const { data, error: checkExistingError } = await supabaseClient
    .from<RecordItem>('records')
    .select('id, amounts', { count: 'exact' })
    .eq('issued_at', newRecord.issued_at)
    .eq('restaurant_id', newRecord.restaurant_id);

  if (checkExistingError) {
    throw new Error(checkExistingError.message);
  }
  if (data.length > 0) {
    const { error } = await supabaseClient
      .from('records')
      .update({
        amounts: [...data[0].amounts, ...newRecord.amounts],
      })
      .eq('id', data[0].id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabaseClient.from('records').insert({
      user_id: newRecord.user_id,
      restaurant_id: newRecord.restaurant_id,
      issued_at: newRecord.issued_at,
      amounts: newRecord.amounts,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
};

const AddRecordForm: React.FC<AddRecordFormProps> = ({
  restaurantId,
  onAdd,
}) => {
  const { closeDrawer } = useBottomFormDrawer();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(addRecord, {
    onMutate: async (newRecord: RecordItem) => {
      await queryClient.cancelQueries(['records', newRecord.restaurant_id]);
      const previousRecords = queryClient.getQueryData<RecordItem[]>([
        'records',
        newRecord.restaurant_id,
      ]);

      if (previousRecords) {
        let newRecords = [];
        const existingDate = previousRecords.filter(
          (rec) => rec.issued_at === newRecord.issued_at
        );
        if (existingDate.length > 0) {
          newRecords = previousRecords.map((rec) => {
            if (rec.issued_at === newRecord.issued_at) {
              return {
                ...rec,
                amounts: [...rec.amounts, ...newRecord.amounts],
              };
            }
            return rec;
          });
        } else {
          newRecords = [
            ...previousRecords,
            {
              id: Math.random(),
              restaurant_id: newRecord.restaurant_id,
              issued_at: newRecord.issued_at,
              amounts: newRecord.amounts,
              user_id: newRecord.user_id,
            },
          ];
        }
        queryClient.setQueryData<RecordItem[]>(
          ['records', newRecord.restaurant_id],
          newRecords
        );
      }

      return { previousRecords };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        ['records', _variables.restaurant_id],
        context?.previousRecords
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(['records']);
    },
  });
  const [dateValue, setDateValue] = useState<string>('');
  const [amountValues, setAmountValues] = useState<AmountValueType[]>([
    {
      id: nanoid(),
      value: 0,
    },
  ]);

  const isFormComplete =
    dateValue !== '' &&
    amountValues.every((amountValue) => amountValue.value !== 0);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setDateValue(date);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newRecord: RecordItem = {
      id: Math.random(),
      user_id: user?.id,
      amounts: amountValues.map((av) => av.value),
      issued_at: dateValue,
      restaurant_id: restaurantId,
    };

    mutate(newRecord);

    closeDrawer();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="inputDate">Date (required):</label>
        <input
          required={true}
          onChange={handleDateChange}
          className="border border-black rounded-md p-2 w-full"
          type={'date'}
          id="inputDate"
          value={dateValue}
        />
      </div>
      <div className="flex flex-col gap-1">
        <AmountInputForm
          amountValues={amountValues}
          setAmountValues={setAmountValues}
        />
      </div>
      <button
        type={'submit'}
        disabled={!isFormComplete}
        className={`mt-2 flex justify-center items-center w-full p-3 border bg-cyan-600 text-white font-semibold text-lg rounded-md
          ${!isFormComplete && 'opacity-30'}
          `}
      >
        Add
      </button>
    </form>
  );
};

export default AddRecordForm;
