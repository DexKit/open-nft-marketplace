import { Network } from '../types/chains';
import { ChainId } from './enum';

import avaxIcon from '../../public/assets/images/icons/avax.png';
import bscIcon from '../../public/assets/images/icons/bnb.svg';
import optimismIcon from '../../public/assets/images/icons/optimism.svg';
import fantomIcon from '../../public/assets/images/icons/fantom.svg';
import ethIcon from '../../public/assets/images/icons/eth.png';
import polygonIcon from '../../public/assets/images/icons/polygon.png';

const infuraKey = process.env.INFURA_API_KEY;

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
    providerRpcUrl: `https://mainnet.infura.io/v3/${infuraKey}`,
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
    providerRpcUrl: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
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
    providerRpcUrl: 'https://bscrpc.com',
    imageUrl: bscIcon.src,
  },
  [ChainId.Rinkeby]: {
    chainId: ChainId.Rinkeby,
    symbol: 'ETH',
    explorerUrl: 'https://rinkeby.etherscan.io',
    name: 'Rinkeby',
    slug: 'rinkeby',
    wrappedAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
    imageUrl: ethIcon.src,
    providerRpcUrl: `https://rinkeby.infura.io/v3/${infuraKey}`,
    testnet: true,
  },
  [ChainId.Ropsten]: {
    chainId: ChainId.Ropsten,
    symbol: 'ETH',
    explorerUrl: 'https://ropsten.etherscan.io',
    name: 'Ropsten',
    slug: 'ropsten',
    wrappedAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
    imageUrl: ethIcon.src,
    providerRpcUrl: `https://ropsten.infura.io/v3/${infuraKey}`,
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
    providerRpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
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
    symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    name: 'Optimism',
    slug: 'optimism',
    coingeckoId: 'ethereum',
    wrappedAddress: '0x4200000000000000000000000000000000000006',
    imageUrl: optimismIcon.src,
    providerRpcUrl: 'https://mainnet.optimism.io',
  },
};
