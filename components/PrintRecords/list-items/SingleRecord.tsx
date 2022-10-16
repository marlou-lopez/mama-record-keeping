import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { RecordItem } from '../../RecordViewItem';

const styles = StyleSheet.create({
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: '4px',
    border: '1px solid rgb(156, 163, 176)',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: 12,
  },
  itemDate: {
    fontSize: 12,
    width: '80px',
  },
  itemAmountList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: 12,
  },
});

const SingleRecord = (item: RecordItem) => {
  return (
    <View key={item.id} style={styles.itemContainer}>
      <View style={styles.itemDate}>
        <Text>{new Date(item.issued_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemAmountList}>
        {item.amounts.map((amt, index) => (
          <Text key={index}>{amt.toLocaleString()}</Text>
        ))}
      </View>
    </View>
  );
};

export default SingleRecord;
