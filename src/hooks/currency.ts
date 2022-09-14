import { ChainId } from '@0x/contract-addresses';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { useAtom, useAtomValue } from 'jotai';
import { useQuery } from 'react-query';
import {
  COINGECKO_ENDPOIT,
  COINGECKO_PLATFORM_ID,
  ZEROEX_NATIVE_TOKEN_ADDRESS
} from '../constants';
import { NETWORKS } from '../constants/chain';
import { getCoinPrices, getTokenPrices } from '../services/currency';
import { currencyAtom } from '../state/atoms';
import { useTokenList } from './blockchain';

export function useCurrency(): string {
  return useAtomValue(currencyAtom) || 'usd';
}

export const GET_COIN_PRICES = 'GET_COIN_PRICES';

export const useCoinPricesQuery = ({
  includeNative,
}: {
  includeNative: boolean;
}) => {
  const { provider, chainId } = useWeb3React();
  const tokens = useTokenList({ chainId });
  const currency = useCurrency();
  return useQuery(
    [GET_COIN_PRICES, chainId, tokens, currency],
    async () => {
      if (
        provider === undefined ||
        chainId === undefined ||
        (tokens === undefined && !includeNative)
      ) {
        return;
      }
      const prices: { [key: string]: { [key: string]: number } } = {};

      if (includeNative) {
        const activeNetwork = NETWORKS[chainId];
        if (activeNetwork && activeNetwork.coingeckoId) {
          const nativePrice = await getCoinPrices({
            coingeckoIds: [activeNetwork.coingeckoId],
            currency,
          });
          if (nativePrice[`${activeNetwork.coingeckoId}`]) {
            prices[ZEROEX_NATIVE_TOKEN_ADDRESS] =
              nativePrice[`${activeNetwork.coingeckoId}`];
          }
        }
      }

      if (tokens.length === 0) {
        return prices;
      }
      const addresses = tokens.map((t) => t.address);
      const tokenPrices = await getTokenPrices({
        addresses,
        currency,
        chainId,
      });
      return { ...prices, ...tokenPrices };
    },
    { enabled: provider !== undefined, suspense: false }
  );
};

export const GET_FIAT_RATION = 'GET_FIAT_RATION';

export function useFiatRatio({
  chainId,
  contractAddress,
  currency,
}: {
  chainId?: ChainId;
  contractAddress?: string;
  currency?: string;
}) {
  return useQuery(
    [GET_FIAT_RATION, chainId, contractAddress, currency],
    async () => {
      if (!chainId || !contractAddress || !currency) {
        return;
      }

      const platformId = COINGECKO_PLATFORM_ID[chainId];

      if (!platformId) {
        return;
      }

      const response = await axios.get(
        `${COINGECKO_ENDPOIT}/simple/token_price/${platformId}?contract_addresses=${contractAddress}&vs_currencies=${currency}`
      );

      return response.data[contractAddress][currency];
    }
  );
}

export const GET_NATIVE_COIN_PRICE = 'GET_NATIVE_COIN_PRICE';

export const useNativeCoinPriceQuery = () => {
  const { provider, chainId } = useWeb3React();

  const [currency] = useAtom(currencyAtom);
  return useQuery(
    [GET_NATIVE_COIN_PRICE, chainId, currency],
    async () => {
      if (provider === undefined || chainId === undefined) {
        return;
      }

      const activeNetwork = NETWORKS[chainId];
      if (activeNetwork && activeNetwork.coingeckoId) {
        const nativePrice = await getCoinPrices({
          coingeckoIds: [activeNetwork.coingeckoId],
          currency,
        });
        if (nativePrice[`${activeNetwork.coingeckoId}`]) {
          return nativePrice[`${activeNetwork.coingeckoId}`];
        }
      }
    },
    { enabled: provider !== undefined, suspense: true }
  );
};
