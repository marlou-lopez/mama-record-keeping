export type DateRange = [string | undefined, string | undefined];
export type DateRangeHandle = {
  clearDateRange: (props?: { ignoreEndDate?: boolean }) => void;
};

export type DateRangePickerProps = {
  value: DateRange;
  onChange: (date: DateRange) => void;
};
