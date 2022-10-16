import { FullRecordItemDetails } from '../../pages/restaurants/all';
import { RecordItem } from '../RecordViewItem';

export type PrintPageProps = {
  data: RecordItem[] | Record<string, FullRecordItemDetails[]>;
  name?: string;
};

export type ColumnProps = {
  data: RecordItem[] | Record<string, FullRecordItemDetails[]>;
};

export type ListItemMultipleProps = {
  date: string;
  records: FullRecordItemDetails[];
};

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type Range = {
  start?: number;
  end?: number;
};

export interface MultipleRecordColumnProps extends Range {
  records: Entries<Record<string, FullRecordItemDetails[]>>;
}

export interface SingleRecordColumnProps extends Range {
  records: RecordItem[];
}
