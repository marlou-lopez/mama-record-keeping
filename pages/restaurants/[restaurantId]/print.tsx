import { PDFViewer, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { RecordItem } from '../../../components/RecordViewItem';
import Layout from '../../../layout/layout';
import { NextPageWithLayout } from '../../_app';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    // flexDirection: 'row',
  }
})

const PrintRecord: NextPageWithLayout = () => {
  const router = useRouter();
  const { restaurantId } = router.query;
  const queryClient = useQueryClient();
  console.log(restaurantId);
  const cachedData = queryClient.getQueryData<RecordItem[]>(['records', restaurantId]);

  console.log(cachedData);
  return (
    <PDFViewer className='w-full h-full'>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{
            backgroundColor: 'red',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            // alignItems: 'center'
          }}>
            {cachedData?.map((data) => {
              return (
               <Text key={data.id}>{data.issued_at}</Text> 
              )
            })}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

PrintRecord.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
export default PrintRecord;
