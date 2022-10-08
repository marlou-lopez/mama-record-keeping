export type RecordItem = {
  id?: number;
  user_id?: string;
  restaurant_id: number;
  issued_at: string;
  amounts: number[];
};

const RecordViewItem: React.FC<RecordItem> = ({ issued_at, amounts, id }) => {
  return (
    <div className="flex flex-col w-full border rounded-md p-2 mb-2 last:mb-0">
      <div className="font-semibold">
        {new Intl.DateTimeFormat('en-US').format(new Date(issued_at))}
      </div>
      <div className="flex justify-end">
        {amounts.length > 1 ? (
          <div className="flex flex-col">
            {amounts.map((a, index) => (
              <span className="text-right" key={`${id}-${index}`}>
                {a.toLocaleString()}
              </span>
            ))}
            <hr className="bg-black" />
            <span className="font-bold">
              {amounts.reduce((acc, curr) => acc + curr, 0).toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="font-bold">{amounts[0].toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};

export default RecordViewItem;
