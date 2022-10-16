import { View, StyleSheet } from '@react-pdf/renderer';
import MultipleRecords from '../list-items/MultipleRecords';
import SingleRecord from '../list-items/SingleRecord';
import { isMultipleRecords } from '../PrintRecords';
import { ColumnProps } from '../types';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    width: '80%',
  },
});

const OneColumnView = ({ data }: ColumnProps) => {
  if (isMultipleRecords(data)) {
    return (
      <View style={styles.container}>
        {Object.entries(data).map(([key, value]) => {
          return <MultipleRecords key={key} date={key} records={value} />;
        })}
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {data.map((d) => {
        return <SingleRecord key={d.id} {...d} />;
      })}
    </View>
  );
};

export default OneColumnView;
