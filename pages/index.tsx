import { useState } from 'react';
import Head from 'next/head';
import SubscriptionForm from '@/components/SubscriptionForm';

export default function Home() {
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleGenerateLink = (data: {
    host: string;
    uuid: string;
    path: string;
    sni: string;
    type: string;
  }) => {
    const { host, uuid, path, sni, type } = data;
    const baseUrl = window.location.origin;
    const queryParams = new URLSearchParams({
      host,
      uuid,
      path: path || '/?ed=2560',
      ...(sni && { sni }),
      type: type || 'ws'
    });
    
    const link = `${baseUrl}/api/subscribe?${queryParams.toString()}`;
    setSubscriptionLink(link);
    
    // 生成二维码（这里可以使用第三方库）
    // setQrCode(qrCodeData);
  };

  return (
    <div>
      <Head>
        <title>优选订阅生成器</title>
        <meta name="description" content="生成优选节点订阅链接" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <h1>优选订阅生成器</h1>
        <SubscriptionForm onSubmit={handleGenerateLink} />
        
               {subscriptionLink && (
          <div className="result-section">
            <h2>您的订阅链接</h2>
            <div className="input-group">
              <input
                type="text"
                value={subscriptionLink}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={() => navigator.clipboard.writeText(subscriptionLink)}>
                复制链接
              </button>
            </div>
            
            {qrCode && (
              <div className="qrcode-section">
                <img src={qrCode} alt="订阅二维码" />
                <p>扫描二维码导入订阅</p>
              </div>
            )}
          </div>
        )}
      </main>
      
            <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }
        
        .result-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        
        .input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .input-group input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
              .input-group button {
          padding: 0.5rem 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .qrcode-section {
          text-align: center;
          margin-top: 1rem;
        }
        
        .qrcode-section img {
          max-width: 200px;
          height: auto;
        }
      `}</style>
    </div>
  );
}