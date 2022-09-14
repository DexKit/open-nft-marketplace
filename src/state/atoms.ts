import { atom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { atomWithStorage } from 'jotai/utils';
import { getAppConfig } from '../services/app';
import { AppState } from '../types/app';
import {
  Token,
  Transaction,
  TransactionMetadata,
  TransactionStatus,
  TransactionType
} from '../types/blockchain';

import { Asset } from '../types/nft';

const appConfig = getAppConfig();

export const appStateAtom = atomWithStorage<AppState>('appState', {
  transactions: {},
  tokens: [],
  isBalancesVisible: true,
  currency: 'usd',
  locale: appConfig.locale || 'en-US',
  assets: {},
});

export const transactionsAtom = focusAtom<
  AppState,
  { [key: string]: Transaction },
  void
>(appStateAtom, (o) => o.prop('transactions'));

export const isBalancesVisibleAtom = focusAtom<AppState, boolean, void>(
  appStateAtom,
  (o) => o.prop('isBalancesVisible')
);

export const pendingTransactionsAtom = atom<any, any>(
  (get) => {
    const transactions = get(transactionsAtom);

    let pendingTxs: { [hash: string]: Transaction } = {};

    for (const hash of Object.keys(transactions)) {
      if (transactions[hash].status === TransactionStatus.Pending) {
        pendingTxs[hash] = transactions[hash];
      }
    }

    return pendingTxs;
  },
  (get, set, arg) => {
    return set(transactionsAtom, arg);
  }
);

export const hasPendingTransactionsAtom = atom(
  (get) => Object.keys(get(pendingTransactionsAtom)).length > 0
);

export const uncheckedTransactionsAtom = atom((get) =>
  Object.keys(get(transactionsAtom))
    .map((key) => {
      const transactions = get(transactionsAtom);

      return transactions[key];
    })
    .filter((t) => !t.checked)
);

export const tokensAtom = focusAtom<AppState, Token[], void>(
  appStateAtom,
  (o) => o.prop('tokens')
);

export const currencyAtom = focusAtom<AppState, string, void>(
  appStateAtom,
  (o) => o.prop('currency')
);

export const localeAtom = focusAtom<AppState, string, void>(appStateAtom, (o) =>
  o.prop('locale')
);

export const assetsAtom = focusAtom<AppState, { [key: string]: Asset }, void>(
  appStateAtom,
  (o) => o.prop('assets')
);

export const transactionDialogOpenAtom = atom(false);
export const transactionDialogHashAtom = atom<string | undefined>(undefined);
export const transactionDialogErrorAtom = atom<Error | undefined>(undefined);
export const transactionDialogMetadataAtom = atom<
  TransactionMetadata | undefined
>(undefined);
export const transactionDialogTypeAtom = atom<TransactionType | undefined>(
  undefined
);

export const switchNetworkOpenAtom = atom(false);
export const switchNetworkChainIdAtom = atom<number | undefined>(undefined);

export const transactionDialogRedirectUrlAtom = atom<string | undefined>(
  undefined
);

export const showSelectCurrencyAtom = atom<boolean>(false);
export const showSelectLocaleAtom = atom<boolean>(false);

export const drawerIsOpenAtom = atom(false);
