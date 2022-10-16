import { nanoid } from 'nanoid';
import { Dispatch, SetStateAction, useState } from 'react';

type AmountValueType = {
  id: string;
  value: number;
};

type AmountInputFormProps = {
  amountValues: AmountValueType[];
  setAmountValues: Dispatch<SetStateAction<AmountValueType[]>>;
};

const AmountInputForm: React.FC<AmountInputFormProps> = ({
  amountValues,
  setAmountValues,
}) => {
  return (
    <>
      <label htmlFor={`amount-${amountValues[0].id}`}>Amount (required):</label>
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-2 max-h-[500px] overflow-auto">
          {amountValues.map((amountValue, amountIndex) => {
            return (
              <div className="flex items-center gap-2" key={amountValue.id}>
                <input
                  autoFocus
                  id={`amount-${amountValue.id}`}
                  className="border border-black rounded-md p-e w-full p-2"
                  type={'number'}
                  onChange={(event) =>
                    setAmountValues((currentAmountValues) =>
                      currentAmountValues.map((currentAmountValue) => {
                        if (currentAmountValue.id === amountValue.id) {
                          return {
                            ...currentAmountValue,
                            value: Number(event.target.value),
                          };
                        }
                        return currentAmountValue;
                      })
                    )
                  }
                />
                {amountIndex > 0 && (
                  <button
                    type={'button'}
                    onClick={() =>
                      setAmountValues((currentAmountValues) =>
                        currentAmountValues.filter(
                          (currentAmountValue) =>
                            currentAmountValue.id !== amountValue.id
                        )
                      )
                    }
                  >
                    x
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          type={'button'}
          onClick={() =>
            setAmountValues((currentAmountValues) => [
              ...currentAmountValues,
              { id: nanoid(), value: 0 },
            ])
          }
          className="p-2 text-sm uppercase text-cyan-600 font-semibold"
        >
          Add more amount
        </button>
      </div>
    </>
  );
};

export default AmountInputForm;
