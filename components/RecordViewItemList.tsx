import RecordViewItem, { RecordItem } from './RecordViewItem';

type RecordViewItemListProps = {
  items: RecordItem[] | undefined;
};

const RecordViewItemList: React.FC<RecordViewItemListProps> = ({ items }) => {
  return (
    <>
      {items?.map((item) => {
        return <RecordViewItem key={item.id} {...item} />;
      })}
    </>
  );
};

export default RecordViewItemList;
