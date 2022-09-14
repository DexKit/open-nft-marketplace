import { ethers } from 'ethers';

// this strategy is deprecated use src/constants/chains.ts file

const infuraKey = process.env.INFURA_API_KEY;

export const mainnetProvider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${infuraKey}`
);

export const ropstenProvider = new ethers.providers.JsonRpcProvider(
  `https://ropsten.infura.io/v3/${infuraKey}`
);

export const rinkebyProvider = new ethers.providers.JsonRpcProvider(
  `https://rinkeby.infura.io/v3/${infuraKey}`
);

export const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraKey}`
);

export const polygonProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mainnet.infura.io/v3/${infuraKey}`
);

export const bscProvider = new ethers.providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/'
);


export const JSON_RPC_PROVIDERS: {
  [key: string]: ethers.providers.JsonRpcProvider;
} = {
  ropsten: ropstenProvider,
  rinkeby: rinkebyProvider,
  mumbai: mumbaiProvider,
  ethereum: mainnetProvider,
  polygon: polygonProvider,
  bsc: bscProvider,
};
