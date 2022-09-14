import { atom, useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { isBalancesVisibleAtom } from '../state/atoms';

import { metaMask } from '../../src/connectors/metamask';
import { walletConnect } from '../../src/connectors/walletConnect';

export function usePositionPaginator(pageSize = 5) {
  const [position, setPosition] = useState({ offset: 0, limit: pageSize });

  const handleNext = useCallback(() => {
    setPosition((value) => ({ ...value, offset: value.offset + pageSize }));
  }, [pageSize]);

  const handlePrevious = useCallback(() => {
    if (position.offset - pageSize >= 0) {
      setPosition((value) => ({ ...value, offset: value.offset - pageSize }));
    }
  }, [position, pageSize]);

  return { position, handleNext, handlePrevious, pageSize };
}

export function useIsBalanceVisible() {
  return useAtomValue(isBalancesVisibleAtom);
}

export function useWalletActivate() {
  return useMutation(async ({ connectorName }: { connectorName: string }) => {
    if (connectorName === 'metamask') {
      return await metaMask.activate();
    } else if (connectorName === 'walletConnect') {
      return await walletConnect.activate();
    }
  });
}

const showSelectIsOpenAtom = atom(false);

export function useSelectNetworkDialog() {
  const [isOpen, setIsOpen] = useAtom(showSelectIsOpenAtom);

  return { isOpen, setIsOpen };
}

export function useDebounce<T>(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
