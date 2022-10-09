import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useQuery } from '@tanstack/react-query';
import { RecordItem } from '../../components/RecordViewItem';
import Layout from '../../layout/layout';
import { NextPageWithLayout } from '../_app';

interface FullRecordItemDetails extends Omit<RecordItem, 'restaurant_id'> {
  restaurantInfo: {
    name: string;
  };
}

const fetchAllRecords = async () => {
  const { data, error } = await supabaseClient.from<FullRecordItemDetails>(
    'records'
  ).select(`
      issued_at,
      id,
      amounts,
      restaurantInfo:restaurants(name)
    `);

  if (error) {
    throw new Error(error.message);
  }

  const formattedRecords = data.reduce<Record<string, FullRecordItemDetails[]>>(
    (acc, cur) => {
      const existingValue = acc[cur.issued_at] ?? [];
      acc[cur.issued_at] = [...existingValue, cur];
      return acc;
    },
    {}
  );
  return formattedRecords;
};

const All: NextPageWithLayout = () => {
  const { data } = useQuery(['records'], () => fetchAllRecords());

  if (!data) {
    return <div>no data</div>;
  }

  return (
    <div>
      {Object.entries(data).map(([key, value]) => {
        return (
          <div key={key} className="p-4 flex border-2">
            <div>
              <p>{new Date(key).toDateString()}</p>
            </div>
            <div className="flex-grow">
              {value.map((record) => {
                const totalAmount = record.amounts.reduce(
                  (acc, cur) => acc + cur,
                  0
                );
                return (
                  <div key={record.id} className="flex justify-between">
                    <div>{record.restaurantInfo.name}</div>
                    <div>{totalAmount}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

All.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default All;
