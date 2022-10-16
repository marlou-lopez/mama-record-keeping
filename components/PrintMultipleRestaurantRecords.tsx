import { PDFViewer, Document, Page, View, StyleSheet, Text } from "@react-pdf/renderer"
import { FullRecordItemDetails } from "../pages/restaurants/all"

// TODO: Reuse existing type with same name and modify
type PageToPrintProps = {
  data: Record<string, FullRecordItemDetails>
}

const styles = StyleSheet.create({
  page: {
    display: 'flex'
  },
  pageWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
})

const PrintMultipleRestaurantRecords = ({ data }: PageToPrintProps) => {
  console.log("Data: ", data);
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.pageWrapper}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Receipt: Multiple</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  )
}

export default PrintMultipleRestaurantRecords;
