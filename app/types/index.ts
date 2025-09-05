export interface SubscribeRequest {
  host: string;
  uuid: string;
  path?: string;
  sni?: string;
  type?: string;
  format?: string;
  mode?: string;
  extra?: string;
}

export interface ProxyConfig {
  subConverter: string;
  subProtocol: string;
  subConfig: string;
  fileName: string;
  noTLS: string;
  alpn: string;
  proxyIPs: string[];
  matchProxyIP: string[];
  httpsPorts: string[];
}

export interface AddressItem {
  ip: string;
  port: string;
  remark?: string;
}

export interface ProcessedContent {
  addresses: AddressItem[];
  content: string;
}