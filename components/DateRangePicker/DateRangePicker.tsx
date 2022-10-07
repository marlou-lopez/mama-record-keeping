import { DateRangePickerProps } from './DateRangePicker.types';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  const startDate = value[0];
  const endDate = value[1];

  const isStartDateEmpty = startDate === undefined || startDate === '';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <label htmlFor="from" className="w-1/2">
          From:
        </label>
        <input
          className="border border-black rounded-md w-1/2 p-2"
          type={'date'}
          onChange={(event) => {
            const newStartDate = event.target.value;
            onChange([newStartDate, endDate]);
          }}
          max={endDate}
          id="from"
          name="from"
        />
      </div>
      <div className="flex">
        <label htmlFor="to" className="w-1/2">
          To:
        </label>
        <input
          className={`border  rounded-md w-1/2 p-2 ${
            isStartDateEmpty ? 'bg-gray-300' : 'border-black'
          }`}
          type={'date'}
          disabled={isStartDateEmpty}
          onChange={(event) => {
            const newEndDate = event.target.value;
            onChange([startDate, newEndDate]);
          }}
          defaultValue={endDate}
          min={startDate}
          // max={currentDate}
          id="to"
          name="to"
          required
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
