import { NextApiRequest, NextApiResponse } from 'next';
import { SubscribeRequest, ProxyConfig } from '@/types';
import { processContent, encodeBase64 } from '@/utils/helpers';

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

// 获取当前域名
function getCurrentDomain(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'https'; // 默认为 https
  const host = req.headers.host || 'localhost:3000'; // 获取 host (域名和端口)
  
  // 如果是本地开发环境，使用 http
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const finalProtocol = isLocal ? 'http' : protocol;
  
  return `${finalProtocol}://${host}`;
}

// 从 API 获取地址列表
async function fetchAddressesFromAPI(apiUrls: string[]): Promise<string> {
  const addresses: string[] = [];
  
  // 使用 Promise.allSettled 确保即使某些 API 失败也不会影响整体
  const results = await Promise.allSettled(
    apiUrls.map(url => 
      fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        // 处理 API 返回的内容
        const lines = text.split('\n').filter(line => line.trim() !== '');
        return lines.join(',');
      })
      .catch(error => {
        console.error(`Failed to fetch from ${url}:`, error);
        return ''; // 返回空字符串表示失败
      })
    )
  );
  
  // 收集所有成功的结果
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      addresses.push(result.value);
    }
  }
  
  return addresses.join(',');
}

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

    console.log('Request parameters:', { host, uuid, path, sni, type, format });

    if (!host || !uuid) {
      return res.status(400).json({ error: 'Missing required parameters: host and uuid' });
    }
 
    // 获取当前域名
    const currentDomain = getCurrentDomain(req);
    console.log('Current domain:', currentDomain);
    
    // 构建动态地址 API 列表
    const dynamicAddressesApi = [
      `${currentDomain}/api/vps789hourcf`,
      `${currentDomain}/api/vps789daycf`
    ];
    
    //'https://raw.githubusercontent.com/cmliu/WorkerVless2sub/main/addressesapi.txt','https://addressesapi.090227.xyz/CloudFlareYes','https://addressesapi.090227.xyz/ip.164746.xyz'
    
    // 获取地址列表 - 优先使用动态 API
    let addressesContent = '';
    
    // 首先尝试从环境变量获取 API 地址
    const addressesApiUrls = process.env.ADDRESSES_API 
      ? process.env.ADDRESSES_API.split(',') 
      : dynamicAddressesApi;
    
    console.log('Using addresses APIs:', addressesApiUrls);
    
    try {
      addressesContent = await fetchAddressesFromAPI(addressesApiUrls);
      console.log('Fetched addresses from API:', addressesContent);
    } catch (error) {
      console.error('Failed to fetch addresses from API:', error);
      // 如果 API 获取失败，使用环境变量中的静态地址
      addressesContent = process.env.ADDRESSES || '';
      console.log('Using static addresses:', addressesContent);
    }
    
    // 如果仍然没有地址，使用默认地址
    if (!addressesContent) {
      console.log('No addresses found, using fallback');
      addressesContent = 'time.is:2053#Keaeye提优支持,icook.hk:2083#备用节点,sk.moe:2096#备用节点,142.171.137.37:8443#备用节点';
    }
    
    const processed = processContent(addressesContent);
    console.log('Processed addresses count:', processed.addresses.length);

    // 构建订阅内容 - 使用 VLESS 协议
    let subscriptionContent = '';
    for (const addr of processed.addresses) {
      const port = addr.port || '443';
      const remark = addr.remark || '';
      
      // 生成 VLESS 链接
      const vlessLink = `vless://${uuid}@${addr.ip}:${port}?encryption=none&security=tls&sni=${sni || host}&alpn=${proxyConfig.alpn}&fp=random&type=${type}&host=${host}&path=${encodeURIComponent(path)}&allowInsecure=1#${encodeURIComponent(remark)}`;
      
      subscriptionContent += vlessLink + '\n';
    }

    console.log('Generated subscription content length:', subscriptionContent.length);

    // 始终返回 Base64 编码的内容
    const base64Content = encodeBase64(subscriptionContent);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    // 直接返回内容，不设置下载头
    return res.status(200).send(base64Content);
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
