// pages/log.ts
import { GetServerSideProps } from 'next';

interface LogEntry {
  timestamp: string;
  ip: string;
  url: string;
  userAgent?: string;
}

interface LogPageProps {
  logs: LogEntry[]; // 假设我们从某个地方获取日志
}

export default function LogPage({ logs }: LogPageProps) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>订阅生成访问日志</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>时间戳</th>
            <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>IP 地址</th>
            <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>请求 URL</th>
            <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{log.timestamp}</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{log.ip}</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{log.url}</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.8rem' }}>{log.userAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 这里假设你有一个获取日志的方法，例如从文件或数据库
// 实际部署中，你可能需要从自己的日志存储中获取数据
export const getServerSideProps: GetServerSideProps = async () => {
  // 示例日志数据，实际应用中你应该从日志文件或数据库读取
  const sampleLogs: LogEntry[] = [
    {
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      url: '/api/subscribe?host=example.com&uuid=123',
      userAgent: 'Mozilla/5.0...'
    }
  ];

  return {
    props: {
      logs: sampleLogs
    }
  };
};