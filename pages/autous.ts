// pages/redirect.js
export async function getServerSideProps({ res }) {
  // 设置重定向头部
  res.writeHead(302, { Location: 'https://sub.miku0.dpdns.org/api/subscribe?host=run.idc0.eu.org&uuid=1ad24c65-3f62-4234-a1e8-290d4c2de009&path=1ad24c65&type=ws' }); // 将 '/target-page' 替换为你想要重定向到的实际 URL
  res.end();

  // 返回一个空的 props 对象，因为我们不需要渲染任何内容
  return { props: {} };
}

function RedirectPage() {
  // 这个组件不会被渲染，因为我们已经在服务器端进行了重定向
  return null;
}

export default RedirectPage;
