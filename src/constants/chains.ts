import type { AddEthereumChainParameter } from '@web3-react/types';
import { ChainId } from './enum';

const infuraKey = process.env.INFURA_API_KEY;

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
};

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency;
}

export function getAddChainParameters(
  chainId: number
): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId];
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls as string[],
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    };
  } else {
    return chainId;
  }
}

export const CHAINS: {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation;
} = {
  [ChainId.ETH]: {
    urls: [
      infuraKey ? `https://mainnet.infura.io/v3/${infuraKey}` : undefined,
      process.env.alchemyKey
        ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}`
        : undefined,
      'https://cloudflare-eth.com',
    ].filter((url) => url !== undefined) as string[],
    name: 'Mainnet',
  },
  [ChainId.Ropsten]: {
    urls: [
      infuraKey ? `https://ropsten.infura.io/v3/${infuraKey}` : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: 'Ropsten',
  },
  [ChainId.Rinkeby]: {
    urls: [
      infuraKey ? `https://rinkeby.infura.io/v3/${infuraKey}` : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: 'Rinkeby',
  },
  5: {
    urls: [
      infuraKey ? `https://goerli.infura.io/v3/${infuraKey}` : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: 'Görli',
  },
  42: {
    urls: [
      infuraKey ? `https://kovan.infura.io/v3/${infuraKey}` : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: 'Kovan',
  },
  // Optimism
  [ChainId.Optimism]: {
    urls: [
      infuraKey
        ? `https://optimism-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://mainnet.optimism.io',
    ].filter((url) => url !== undefined) as string[],
    name: 'Optimism',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  69: {
    urls: [
      infuraKey
        ? `https://optimism-kovan.infura.io/v3/${infuraKey}`
        : undefined,
      'https://kovan.optimism.io',
    ].filter((url) => url !== undefined) as string[],
    name: 'Optimism Kovan',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
  },
  // Arbitrum
  [ChainId.Arbitrum]: {
    urls: [
      infuraKey
        ? `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://arb1.arbitrum.io/rpc',
    ].filter((url) => url !== undefined) as string[],
    name: 'Arbitrum One',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  421611: {
    urls: [
      infuraKey
        ? `https://arbitrum-rinkeby.infura.io/v3/${infuraKey}`
        : undefined,
      'https://rinkeby.arbitrum.io/rpc',
    ].filter((url) => url !== undefined) as string[],
    name: 'Arbitrum Testnet',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://testnet.arbiscan.io'],
  },
  // Polygon
  [ChainId.Polygon]: {
    urls: [
      infuraKey
        ? `https://polygon-mainnet.infura.io/v3/${infuraKey}`
        : undefined,
      'https://polygon-rpc.com',
    ].filter((url) => url !== undefined) as string[],
    name: 'Polygon Mainnet',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  80001: {
    urls: [
      infuraKey
        ? `https://polygon-mumbai.infura.io/v3/${infuraKey}`
        : undefined,
    ].filter((url) => url !== undefined) as string[],
    name: 'Polygon Mumbai',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
};

export const URLS: { [chainId: number]: string[] } = Object.keys(
  CHAINS
).reduce<{ [chainId: number]: string[] }>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].urls;

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }

  return accumulator;
}, {});
