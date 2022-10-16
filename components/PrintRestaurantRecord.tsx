import {
  Page,
  PDFViewer,
  View,
  Document,
  StyleSheet,
  Text,
} from '@react-pdf/renderer';
import { FullRecordItemDetails } from '../pages/restaurants/all';
import { RecordItem } from './RecordViewItem';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    // flexDirection: 'row',
  },
  pageWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pageHeader: {
    borderBottom: '1px solid grey',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    height: '64px',
    padding: '8px',
    alignItems: 'center',
  },
  pageHeaderText: {
    fontWeight: 'bold',
    fontSize: '24px',
  },
  listContainerTwoColumn: {
    display: 'flex',
    flexDirection: 'row',
    padding: '16px',
    width: '100%',
  },
  listContainerOneColum: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    width: '80%',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    border: '1px solid #000',
    padding: '4px',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  amountList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 4,
    right: 76,
    // paddingVertical: '8px',
    // paddingHorizontal: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '100%',
  },
  total: {
    fontSize: '18px',
    border: '1px solid rgb(156, 163, 176)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  listMultipleContainer: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    // border: '1px solid #eee',
    border: '1px solid rgb(156, 163, 176)',
    marginBottom: '2px',
  },
  listMultipleDate: {
    fontSize: '12px',
    width: '80px',
  },
  listMultipleRecords: {
    display: 'flex',
    flexGrow: 1,
  },
  listMultipleRecord: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '2px',
  },
});

type PrintPageProps = {
  data: RecordItem[] | Record<string, FullRecordItemDetails[]>;
  name?: string;
};

type ColumnProps = {
  data: RecordItem[] | Record<string, FullRecordItemDetails[]>;
};

function isMultipleRecords(
  data: PrintPageProps['data']
): data is Record<string, FullRecordItemDetails[]> {
  return !Array.isArray(data);
}

const COLUMN_LIMIT = 15;

const ListItemSingle = (item: RecordItem) => {
  return (
    <View key={item.id} style={styles.listItem}>
      <Text>{new Date(item.issued_at).toDateString()}</Text>
      <View style={styles.amountList}>
        {item.amounts.map((amt, index) => (
          <Text key={index}>{amt.toLocaleString()}</Text>
        ))}
      </View>
    </View>
  );
};

type ListItemMultipleProps = {
  date: string;
  records: FullRecordItemDetails[];
};

const ListItemMultiple = ({ date, records }: ListItemMultipleProps) => {
  return (
    <View style={styles.listMultipleContainer}>
      <View style={styles.listMultipleDate}>
        <Text>{new Date(date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.listMultipleRecords}>
        {records.map((record) => {
          const totalAmount = record.amounts.reduce((acc, cur) => acc + cur, 0);
          return (
            <View key={record.id} style={styles.listMultipleRecord}>
              <Text>{record.restaurantInfo.name}</Text>
              <Text>{totalAmount.toLocaleString()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const TwoColumn = ({ data }: ColumnProps) => {
  if (isMultipleRecords(data)) {
    return (
      <>
        <View
          style={{
            flexGrow: 1,
          }}
        >
          {Object.entries(data)
            .slice(0, COLUMN_LIMIT)
            .map(([key, value]) => {
              return <ListItemMultiple key={key} date={key} records={value} />;
            })}
        </View>
        <View
          style={{
            flexGrow: 1,
            marginLeft: '8px',
          }}
        >
          {Object.entries(data)
            .slice(COLUMN_LIMIT, Object.keys(data).length)
            .map(([key, value]) => {
              return <ListItemMultiple key={key} date={key} records={value} />;
            })}
        </View>
      </>
    );
  }
  return (
    <>
      <View
        style={{
          flexGrow: 1,
        }}
      >
        {data.slice(0, COLUMN_LIMIT).map((d) => {
          return <ListItemSingle key={d.id} {...d} />;
        })}
      </View>
      <View
        style={{
          flexGrow: 1,
          marginLeft: '8px',
        }}
      >
        {data.slice(COLUMN_LIMIT, data.length).map((d) => {
          return <ListItemSingle key={d.id} {...d} />;
        })}
      </View>
    </>
  );
};

const OneColumn = ({ data }: ColumnProps) => {
  if (isMultipleRecords(data)) {
    return (
      <View>
        {Object.entries(data).map(([key, value]) => {
          return <ListItemMultiple key={key} date={key} records={value} />;
        })}
      </View>
    );
  }
  return (
    <View>
      {data.map((d) => {
        return <ListItemSingle key={d.id} {...d} />;
      })}
    </View>
  );
};

const PrintPageContent = ({ data }: Pick<PrintPageProps, 'data'>) => {
  const numberOfRecords = isMultipleRecords(data)
    ? Object.keys(data).length
    : data.length;
  if (numberOfRecords > 15) return <TwoColumn data={data} />;
  return <OneColumn data={data} />;
};

const PrintPageFooter = ({ data }: Pick<PrintPageProps, 'data'>) => {
  const allRecordAmounts = isMultipleRecords(data)
    ? Object.values(data)
        .flat()
        .map((d) => {
          const { restaurantInfo, ...rest } = d;
          return rest;
        })
    : data;
  return (
    <Text style={styles.total}>
      Total:{' '}
      {allRecordAmounts
        .reduce((acc, cur) => {
          return acc + cur.amounts.reduce((a, c) => a + c, 0);
        }, 0)
        .toLocaleString()}
    </Text>
  );
};

const getRangeInText = (data: Record<string, FullRecordItemDetails[]>) => {
  const dates = Object.keys(data);
  return `${new Date(dates[0]).toLocaleDateString()} - ${new Date(
    dates[dates.length - 1]
  ).toLocaleDateString()}`;
};

const PrintRestaurantRecord = ({ data, name = 'Multiple' }: PrintPageProps) => {
  const numberOfRecords = isMultipleRecords(data)
    ? Object.keys(data).length
    : data.length;

  const headerText = isMultipleRecords(data) ? getRangeInText(data) : name;
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.pageWrapper}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Receipt: {headerText}</Text>
            </View>
            <View
              style={
                numberOfRecords > COLUMN_LIMIT
                  ? styles.listContainerTwoColumn
                  : styles.listContainerOneColum
              }
            >
              <PrintPageContent data={data} />
            </View>
            <View style={styles.footer}>
              <PrintPageFooter data={data} />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PrintRestaurantRecord;
