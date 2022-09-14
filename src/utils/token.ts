import { BigNumber, ethers } from 'ethers';
import defaultConfig from '../../config/default.tokenlist.json';
import { ChainId } from '../constants/enum';

export function GET_TOKEN(address: string, chainId: number) {
  let index = defaultConfig.tokens.findIndex((t) => {
    return (
      t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId
    );
  });
  if (index === -1) {
    return;
  }

  return defaultConfig.tokens[index];
}

export function TOKEN_ICON_URL(address: string, chainId?: ChainId) {
  switch (chainId) {
    case ChainId.ETH:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/ethereum/assets/${address}/logo.png`;
    case ChainId.Polygon:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/polygon/assets/${address}/logo.png`;
    case ChainId.AVAX:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/avalanchex/assets/${address}/logo.png`;
    case ChainId.BSC:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/binance/assets/${address}/logo.png`;
    case ChainId.FANTOM:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/fantom/assets/${address}/logo.png`;
    case ChainId.CELO:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/celo/assets/${address}/logo.png`;
    case ChainId.Optimism:
      return `https://raw.githubusercontent.com/trustwallet/tokens/master/blockchains/optimism/assets/${address}/logo.png`;
    default:
      return '';
  }
}

export function formatUnits(balance: BigNumber, decimals: number) {
  return Number(ethers.utils.formatUnits(balance, decimals)).toFixed(3);
}
