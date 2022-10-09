import {
  Page,
  PDFViewer,
  View,
  Document,
  StyleSheet,
  Text,
} from '@react-pdf/renderer';
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
    bottom: 0,
    paddingVertical: '8px',
    paddingHorizontal: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '100%',
  },
  total: {
    fontSize: '24px',
    border: '2px solid #000',
    padding: '18px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

type PageToPrintProps = {
  data: RecordItem[];
  name?: string;
};

const COLUMN_LIMIT = 15;

const ListItem = (item: RecordItem) => {
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

type ColumnProps = {
  data: RecordItem[];
};
const TwoColumn = ({ data }: ColumnProps) => {
  return (
    <>
      <View
        style={{
          flexGrow: 1,
        }}
      >
        {data.slice(0, COLUMN_LIMIT).map((d) => {
          return <ListItem key={d.id} {...d} />;
        })}
      </View>
      <View
        style={{
          flexGrow: 1,
          marginLeft: '8px',
        }}
      >
        {data.slice(COLUMN_LIMIT, data.length).map((d) => {
          return <ListItem key={d.id} {...d} />;
        })}
      </View>
    </>
  );
};

const OneColumn = ({ data }: ColumnProps) => {
  return (
    <View>
      {data.map((d) => {
        return <ListItem key={d.id} {...d} />;
      })}
    </View>
  );
};
const PrintRestaurantRecord = ({ data, name }: PageToPrintProps) => {
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.pageWrapper}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Receipt: {name}</Text>
            </View>
            <View
              style={
                data.length > COLUMN_LIMIT
                  ? styles.listContainerTwoColumn
                  : styles.listContainerOneColum
              }
            >
              {data.length > 15 ? (
                <TwoColumn data={data} />
              ) : (
                <OneColumn data={data} />
              )}
            </View>
            <View style={styles.footer}>
              <Text style={styles.total}>
                Total:{' '}
                {data
                  .reduce((acc, cur) => {
                    return acc + cur.amounts.reduce((a, c) => a + c, 0);
                  }, 0)
                  .toLocaleString()}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PrintRestaurantRecord;
