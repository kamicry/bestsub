import { NextApiRequest, NextApiResponse } from 'next';
import { SubscribeRequest, ProxyConfig } from '@/types';
import { processContent, encodeBase64, decodeBase64 } from '@/utils/helpers';

// 配置（可以从环境变量获取）
const proxyConfig: ProxyConfig = {
  subConverter: process.env.SUB_API || 'sub.cmliussss.net',
  subProtocol: process.env.SUB_PROTOCOL || 'https',
  subConfig: process.env.SUB_CONFIG || 'https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini',
  fileName: process.env.SUB_NAME || '优选订阅生成器',
  noTLS: process.env.NO_TLS || 'false',
  alpn: process.env.ALPN || 'h3',
  proxyIPs: process.env.PROXY_IPS ? process.env.PROXY_IPS.split(',') : [],
  matchProxyIP: process.env.MATCH_PROXY_IPS ? process.env.MATCH_PROXY_IPS.split(',') : [],
  httpsPorts: process.env.HTTPS_PORTS ? process.env.HTTPS_PORTS.split(',') : ['2053', '2083', '2087', '2096', '8443']
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const {
      host,
      uuid,
      path = '/?ed=2560',
      sni,
      type = 'ws',
      format,
      mode,
      extra
    } = req.query as unknown as SubscribeRequest;

    if (!host || !uuid) {
      return res.status(400).json({ error: 'Missing required parameters: host and uuid' });
    }
 // 获取地址列表（这里简化处理，实际可以从数据库或其他API获取）
    const addressesContent = process.env.ADDRESSES || '';
    const processed = processContent(addressesContent);

    // 构建订阅内容
    let subscriptionContent = '';
    for (const addr of processed.addresses) {
      const port = addr.port || '443';
      const remark = addr.remark || '';
      
      // 根据协议类型构建不同的订阅链接
      const vmessLink = `vmess://${encodeBase64(JSON.stringify({
        v: '2',
        ps: `${remark} - 优选节点`,
        add: addr.ip,
        port: port,
        id: uuid,
        aid: '0',
        scy: 'auto',
        net: type,
        host: host,
        path: path,
        tls: port === '443' ? 'tls' : '',
        sni: sni || host
      }))}`;
      
      subscriptionContent += vmessLink + '\n';
    }

    // 根据不同客户端类型返回不同格式
    const userAgent = req.headers['user-agent']?.toLowerCase() || '';
    
    if (userAgent.includes('clash') || format === 'clash') {
      // 调用订阅转换API
      const subConverterUrl = `${proxyConfig.subProtocol}://${proxyConfig.subConverter}/sub?target=clash&url=${encodeURIComponent(`${req.headers.host}${req.url}`)}&insert=false&config=${encodeURIComponent(proxyConfig.subConfig)}`;
      
      try {
        const converterResponse = await fetch(subConverterUrl);
        const converterContent = await converterResponse.text();
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${proxyConfig.fileName}.yaml"`);
        return res.status(200).send(converterContent);
      } catch (error) {
        console.error('Sub converter error:', error);
        
              // 如果转换失败，返回原始内容
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(subscriptionContent);
      }
    } else {
      // 返回原始base64编码内容
      const base64Content = encodeBase64(subscriptionContent);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${proxyConfig.fileName}.txt"`);
      return res.status(200).send(base64Content);
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}