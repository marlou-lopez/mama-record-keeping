import Layout from '../layout/layout';
import { NextPageWithLayout } from './_app';

const Print: NextPageWithLayout = () => {
  return <div>Print</div>;
};

Print.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Print;
