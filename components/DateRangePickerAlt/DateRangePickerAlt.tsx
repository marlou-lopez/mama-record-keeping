import React, { useRef, useImperativeHandle } from 'react';
import {
  DateRangeHandleAlt,
  DateRangePickerAltProps,
} from './DateRangePickerAlt.types';

const DateRangePickerAlt = React.forwardRef<
  DateRangeHandleAlt,
  DateRangePickerAltProps
>(function DateRangePicker({ value, onChange }, ref) {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const isStartDateEmpty = value[0] === undefined || value[0] === '';

  useImperativeHandle(ref, () => ({
    clearDateRange: (props) => {
      if (startDateRef.current?.value) {
        startDateRef.current.value = '';
      }
      if (!props?.ignoreEndDate) {
        if (endDateRef.current?.value) {
          endDateRef.current.value = '';
        }
      }
    },
  }));

  return (
    <>
      <div className="flex">
        <label htmlFor="from" className="w-1/2">
          From:
        </label>
        <input
          ref={startDateRef}
          className="border border-black rounded-md w-1/2 p-2"
          type={'date'}
          onChange={(event) => {
            const fromDate = event.target.value;
            onChange([fromDate, value[1]]);
          }}
          id="from"
          name="from"
        />
      </div>
      <div className="flex">
        <label htmlFor="to" className="w-1/2">
          To:
        </label>
        <input
          ref={endDateRef}
          className={`border  rounded-md w-1/2 p-2 ${
            isStartDateEmpty ? 'bg-gray-300' : 'border-black'
          }`}
          type={'date'}
          disabled={isStartDateEmpty}
          onChange={(event) => {
            const toDate = event.target.value;
            onChange([value[0], toDate]);
          }}
          defaultValue={value[1]}
          min={value[0]}
          // max={currentDate}
          id="to"
          name="to"
        />
      </div>
    </>
  );
});

export default DateRangePickerAlt;
