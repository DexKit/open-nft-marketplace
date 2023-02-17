import { useWeb3React } from '@web3-react/core';
import { useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';
import {
  switchNetworkChainIdAtom,
  switchNetworkOpenAtom,
  tokensAtom
} from '../state/atoms';
import {
  getNativeCurrencyImage,
  getNativeCurrencySymbol, switchNetwork
} from '../utils/blockchain';

import { ZEROEX_NATIVE_TOKEN_ADDRESS } from '../constants';
import { Token } from '../types/blockchain';

import { NETWORKS } from '../constants/chain';

import tokenListJson from '../../config/default.tokenlist.json';
import { getTokenData } from '../services/blockchain';

export function useBlockNumber() {
  const { provider } = useWeb3React();

  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    if (provider) {
      const handleBlockNumber = (blockNumber: any) => {
        setBlockNumber(blockNumber);
      };

      provider?.on('block', handleBlockNumber);

      return () => {
        provider?.removeListener('block', handleBlockNumber);
      };
    }
  }, [provider]);

  return blockNumber;
}

export function useSwitchNetwork() {
  const setSwitchOpen = useUpdateAtom(switchNetworkOpenAtom);
  const setSwitchChainId = useUpdateAtom(switchNetworkChainIdAtom);

  const openDialog = useCallback((chainId: number) => {
    setSwitchOpen(true);
    setSwitchChainId(chainId);
  }, []);

  return {
    openDialog,
  };
}

export function useSwitchNetworkMutation() {
  const { connector } = useWeb3React();

  return useMutation<unknown, Error, { chainId: number }>(
    async ({ chainId }) => {
      return switchNetwork(connector, chainId);
    }
  );
}

export function useTokenList({
  chainId,
  includeNative = false,
}: {
  chainId?: number;
  includeNative?: boolean;
}) {
  const tokensValues = useAtomValue(tokensAtom);

  const tokens = [...tokensValues, ...tokenListJson.tokens];

  return useMemo(() => {
    if (chainId === undefined) {
      return [] as Token[];
    }

    let tokenList: Token[] = [
      ...tokens.filter((token: Token) => token.chainId === chainId),
    ];

    const wrappedAddress = NETWORKS[chainId]?.wrappedAddress;
    const isNoWrappedTokenInList =
      tokenList &&
      tokenList.findIndex((t) => t.address.toLowerCase() === wrappedAddress) ===
      -1;
    // Wrapped Token is not on the list, we will add it here
    if (wrappedAddress && isNoWrappedTokenInList) {
      tokenList = [
        {
          address: wrappedAddress,
          chainId,
          decimals: 18,
          logoURI: getNativeCurrencyImage(chainId),
          name: `Wrapped ${getNativeCurrencySymbol(chainId)}`,
          symbol: `W${getNativeCurrencySymbol(chainId)}`,
        } as Token,
        ...tokenList,
      ];
    }

    if (includeNative) {
      return [
        {
          address: ZEROEX_NATIVE_TOKEN_ADDRESS,
          chainId,
          decimals: 18,
          logoURI: getNativeCurrencyImage(chainId),
          name: getNativeCurrencySymbol(chainId),
          symbol: getNativeCurrencySymbol(chainId),
        },
        ...tokenList,
      ] as Token[];
    }

    return [...tokenList] as Token[];
  }, [chainId]);
}

export function useTokenData(options?: Omit<UseMutationOptions, any>) {
  return useMutation(
    async ({ chainId, address }: { chainId: number; address: string }) => {
      return await getTokenData(chainId, address);
    },
    options
  );
}
