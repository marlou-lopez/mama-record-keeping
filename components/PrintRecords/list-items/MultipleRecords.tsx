import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ListItemMultipleProps } from '../types';

const styles = StyleSheet.create({
  itemContainer: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    border: '1px solid rgb(156, 163, 176)',
    marginBottom: '2px',
  },
  itemDate: {
    fontSize: 12,
    width: '80px',
  },
  itemRecordsContainer: {
    display: 'flex',
    flexGrow: 1,
  },
  itemRecord: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12,
    marginBottom: '2px',
  },
});

const MultipleRecords = ({ date, records }: ListItemMultipleProps) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDate}>
        <Text>{new Date(date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemRecordsContainer}>
        {records.map((record) => {
          const totalAmount = record.amounts.reduce((acc, cur) => acc + cur, 0);
          return (
            <View key={record.id} style={styles.itemRecord}>
              <Text>{record.restaurantInfo.name}</Text>
              <Text>{totalAmount.toLocaleString()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default MultipleRecords;
