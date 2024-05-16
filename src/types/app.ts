import type { Token, Transaction } from './blockchain';
import type { Asset } from './nft';

export interface AppState {
  transactions: { [hash: string]: Transaction };
  tokens: Token[];
  isBalancesVisible: boolean;
  currency: string;
  locale: string;
  assets: { [key: string]: Asset };
}

export interface Currency {
  symbol: string;
  name: string;
}

export interface Language {
  name: string;
  locale: string;
}
