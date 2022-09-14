export interface Network {
  symbol: string;
  name: string;
  chainId: number;
  slug: string;
  explorerUrl: string;
  imageUrl?: string;
  providerRpcUrl?: string;
  coingeckoId?: string;
  wrappedAddress?: string;
  testnet?: boolean;
  tokenName?: string;
}
