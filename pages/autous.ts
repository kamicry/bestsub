// pages/autous.ts
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const { res } = context;

  // 设置重定向头部
  res.writeHead(302, { Location: 'https://sub.miku0.dpdns.org/api/subscribe?host=run.idc0.eu.org&uuid=1ad24c65-3f62-4234-a1e8-290d4c2de009&path=1ad24c65&type=ws' });
  res.end();

  return { props: {} };
};

function RedirectPage() {
  return null;
}

export default RedirectPage;
