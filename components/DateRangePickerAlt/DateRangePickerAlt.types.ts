export type DateRangeAlt = [string | undefined, string | undefined];
export type DateRangeHandleAlt = {
  clearDateRange: (props?: { ignoreEndDate?: boolean }) => void;
};

export type DateRangePickerAltProps = {
  value: DateRangeAlt;
  onChange: (date: DateRangeAlt) => void;
};
