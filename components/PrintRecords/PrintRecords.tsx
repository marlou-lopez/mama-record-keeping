import {
  Page,
  PDFViewer,
  View,
  Document,
  StyleSheet,
  Text,
} from '@react-pdf/renderer';
import { FullRecordItemDetails } from '../../pages/restaurants/all';
import { PrintPageProps } from './types';
import OneColumnView from './views/OneColumnView';
import TwoColumnView from './views/TwoColumnView';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
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
  footer: {
    position: 'absolute',
    bottom: 4,
    right: 76,
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
});

export function isMultipleRecords(
  data: PrintPageProps['data']
): data is Record<string, FullRecordItemDetails[]> {
  return !Array.isArray(data);
}

export const COLUMN_LIMIT = 15;

const PrintPageContent = ({ data }: Pick<PrintPageProps, 'data'>) => {
  const numberOfRecords = isMultipleRecords(data)
    ? Object.keys(data).length
    : data.length;
  if (numberOfRecords > 15) return <TwoColumnView data={data} />;
  return <OneColumnView data={data} />;
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

const getDateRangeInText = (data: Record<string, FullRecordItemDetails[]>) => {
  const dates = Object.keys(data);
  return `${new Date(dates[0]).toLocaleDateString()} - ${new Date(
    dates[dates.length - 1]
  ).toLocaleDateString()}`;
};

const PrintRecords = ({ data, name = 'Multiple' }: PrintPageProps) => {
  const headerText = isMultipleRecords(data) ? getDateRangeInText(data) : name;
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.pageWrapper}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Receipt: {headerText}</Text>
            </View>
            <PrintPageContent data={data} />
            <View>
              <PrintPageFooter data={data} />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PrintRecords;
