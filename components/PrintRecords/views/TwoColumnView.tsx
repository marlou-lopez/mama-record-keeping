import { View, StyleSheet } from '@react-pdf/renderer';
import MultipleRecords from '../list-items/MultipleRecords';
import SingleRecord from '../list-items/SingleRecord';
import { COLUMN_LIMIT, isMultipleRecords } from '../PrintRecords';
import {
  ColumnProps,
  MultipleRecordColumnProps,
  SingleRecordColumnProps,
} from '../types';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    padding: '16px',
    width: '100%',
  },
});

const MultipleRecordsColumn = ({
  records,
  start = 0,
  end = records.length,
}: MultipleRecordColumnProps) => {
  return (
    <>
      {records.slice(start, end).map(([key, value]) => {
        return <MultipleRecords key={key} date={key} records={value} />;
      })}
    </>
  );
};

const SingleRecordColumn = ({
  records,
  start = 0,
  end = records.length,
}: SingleRecordColumnProps) => {
  return (
    <>
      {records.slice(start, end).map((d) => {
        return <SingleRecord key={d.id} {...d} />;
      })}
    </>
  );
};

const TwoColumnView = ({ data }: ColumnProps) => {
  if (isMultipleRecords(data)) {
    const records = Object.entries(data);

    return (
      <View style={styles.container}>
        <View
          style={{
            flexGrow: 1,
          }}
        >
          <MultipleRecordsColumn records={records} end={COLUMN_LIMIT} />
        </View>
        <View
          style={{
            flexGrow: 1,
            marginLeft: '8px',
          }}
        >
          <MultipleRecordsColumn records={records} start={COLUMN_LIMIT} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View
        style={{
          flexGrow: 1,
        }}
      >
        <SingleRecordColumn records={data} end={COLUMN_LIMIT} />
      </View>
      <View
        style={{
          flexGrow: 1,
          marginLeft: '8px',
        }}
      >
        <SingleRecordColumn records={data} start={COLUMN_LIMIT} />
      </View>
    </View>
  );
};

export default TwoColumnView;
