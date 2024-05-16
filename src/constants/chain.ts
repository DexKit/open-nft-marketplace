import { Network } from '../types/chains';
import { ChainId } from './enum';

import avaxIcon from '../../public/assets/images/icons/avax.png';
import bscIcon from '../../public/assets/images/icons/bnb.svg';
import optimismIcon from '../../public/assets/images/icons/optimism.svg';
import fantomIcon from '../../public/assets/images/icons/fantom.svg';
import ethIcon from '../../public/assets/images/icons/eth.png';
import polygonIcon from '../../public/assets/images/icons/polygon.png';
import arbitrumIcon from '../../public/assets/images/icons/arbitrum.png';


export const NETWORKS: { [key: number]: Network } = {
  [ChainId.ETH]: {
    chainId: ChainId.ETH,
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
    name: 'Ethereum',
    slug: 'ethereum',
    coingeckoId: 'ethereum',
    wrappedAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    imageUrl: ethIcon.src,
    providerRpcUrl: `https://eth.llamarpc.com`,
  },
  [ChainId.Mumbai]: {
    chainId: ChainId.Mumbai,
    symbol: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    name: 'Mumbai',
    slug: 'mumbai',
    wrappedAddress: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
    imageUrl: polygonIcon.src,
    providerRpcUrl: `https://rpc.ankr.com/polygon_mumbai`,
    testnet: true,
  },
  [ChainId.Polygon]: {
    chainId: ChainId.Polygon,
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    name: 'Polygon',
    slug: 'polygon',
    coingeckoId: 'matic-network',
    wrappedAddress: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`,
    providerRpcUrl: `https://polygon-rpc.com/`,
    imageUrl: polygonIcon.src,
  },
  [ChainId.BSC]: {
    chainId: ChainId.BSC,
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
    name: 'Smart Chain',
    slug: 'bsc',
    coingeckoId: 'binancecoin',
    wrappedAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    providerRpcUrl: 'https://binance.llamarpc.com',
    imageUrl: bscIcon.src,
  },
  [ChainId.Sepolia]: {
    chainId: ChainId.Rinkeby,
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    name: 'Sepolia',
    slug: 'sepolia',
    wrappedAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    imageUrl: ethIcon.src,
    providerRpcUrl: `https://public.stackup.sh/api/v1/node/ethereum-sepolia`,
    testnet: true,
  },
  [ChainId.AVAX]: {
    chainId: ChainId.AVAX,
    symbol: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    name: 'Avalanche',
    slug: 'avalanche',
    coingeckoId: 'avalanche-2',
    wrappedAddress: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    imageUrl: avaxIcon.src,
    providerRpcUrl: 'https://avalanche.public-rpc.com',
  },
  [ChainId.FANTOM]: {
    chainId: ChainId.FANTOM,
    symbol: 'FTM',
    explorerUrl: 'https://ftmscan.com',
    name: 'Fantom',
    slug: 'fantom',
    coingeckoId: 'fantom',
    wrappedAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    imageUrl: fantomIcon.src,
    providerRpcUrl: 'https://rpc.ftm.tools',
  },
  [ChainId.Optimism]: {
    chainId: ChainId.Optimism,
    symbol: 'OP',
    nativeCurrencyUrl: ethIcon.src,
    explorerUrl: 'https://optimistic.etherscan.io',
    name: 'Optimism',
    slug: 'optimism',
    coingeckoId: 'ethereum',
    wrappedAddress: '0x4200000000000000000000000000000000000006',
    imageUrl: optimismIcon.src,
    providerRpcUrl: 'https://mainnet.optimism.io',
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    }
  },
  [ChainId.Arbitrum]: {
    chainId: ChainId.Arbitrum,
    symbol: 'ARB',
    explorerUrl: 'https://arbiscan.io/',
    name: 'Arbitrum',
    slug: 'arbitrum',
    coingeckoId: 'ethereum',
    wrappedAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    nativeCurrencyUrl: ethIcon.src,
    imageUrl: arbitrumIcon.src,
    providerRpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH',
    }
  },
};
