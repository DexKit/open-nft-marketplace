import { AddEthereumChainParameter } from "@web3-react/types";


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
  nativeCurrency?: AddEthereumChainParameter['nativeCurrency'];
  nativeCurrencyUrl?: string;
}
