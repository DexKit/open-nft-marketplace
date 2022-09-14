import moment from 'moment';
import { Currency, Language } from '../types/app';
import { Token } from '../types/blockchain';
import { ChainId } from './enum';

export const TRADER_ORDERBOOK_API = 'https://api.trader.xyz/orderbook/orders';

export const ZEROEX_NATIVE_TOKEN_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const MULTICALL_NATIVE_TOKEN_ADDRESS =
  '0x0000000000000000000000000000000000000000';

export const WRAPPED_ETHER_CONTRACT: { [key: number]: string } = {
  3: '0xc778417e063141139fce010982780140aa0cd5ab',
};

export const ETH_COIN: Token = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  address: ZEROEX_NATIVE_TOKEN_ADDRESS,
  logoURI: '',
  chainId: ChainId.ETH,
};

export const MATIC_COIN: Token = {
  name: 'Polygon',
  symbol: 'MATIC',
  decimals: 18,
  address: ZEROEX_NATIVE_TOKEN_ADDRESS,
  logoURI: '',
  chainId: ChainId.Polygon,
};

export const MIN_ORDER_DATE_TIME = moment.duration(1, 'hour');

export const COINGECKO_ENDPOIT = 'https://api.coingecko.com/api/v3';

export const COINGECKO_PLATFORM_ID: { [key: number]: string } = {
  [ChainId.ETH]: 'ethereum',
  [ChainId.Polygon]: 'polygon-pos',
  [ChainId.BSC]: 'binance-smart-chain',
  [ChainId.AVAX]: 'avalanche',
  [ChainId.CELO]: 'celo',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.Optimism]: 'optimistic-ethereum',
};

export const LANGUAGES: Language[] = [
  { name: 'English (US)', locale: 'en-US' },
  { name: 'Português (BR)', locale: 'pt-BR' },
  { name: 'Español (ES)', locale: 'es-ES' },
];

export const CURRENCIES: Currency[] = [{ symbol: 'usd', name: 'US Dollar' }];
