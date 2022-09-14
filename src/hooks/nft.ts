import {
  NftSwapV4,
  SwappableAssetV4,
  SwappableNftV4
} from '@traderxyz/nft-swap-sdk';
import { useCallback, useMemo } from 'react';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions
} from 'react-query';

import { BigNumber, ethers } from 'ethers';
import { WETHAbi } from '../constants/abis';

import { useWeb3React } from '@web3-react/core';
import { WRAPPED_ETHER_CONTRACT } from '../constants';
import {
  getAssetData,
  getAssetMetadata,
  getAssetsData,
  getAssetsFromOrderbook,
  getCollectionData
} from '../services/nft';

import { ChainId, NFTType } from '../constants/enum';
import {
  Asset,
  AssetMetadata,
  OrderBookItem,
  SwapApiOrder
} from '../types/nft';

import { PostOrderResponsePayload } from '@traderxyz/nft-swap-sdk/dist/sdk/v4/orderbook';
import { useAtom } from 'jotai';
import { getAppConfig } from '../services/app';
import { getERC20Balance } from '../services/balances';
import { getOrderbookOrders } from '../services/nft';
import { assetsAtom } from '../state/atoms';
import { isAddressEqual } from '../utils/blockchain';
import { calculeFees } from '../utils/nfts';
import { TraderOrderFilter } from '../utils/types';
import { useTokenList } from './blockchain';

export const GET_ASSET_DATA = 'GET_ASSET_DATA';

const appConfig = getAppConfig();

export function useAsset(
  contractAddress?: string,
  tokenId?: string,
  options?: Omit<UseQueryOptions<Asset>, any>,
  lazy?: boolean
) {
  const queryClient = useQueryClient();
  const { provider, chainId, isActive } = useWeb3React();

  const assetCached = queryClient.getQueryState<Asset | undefined>([
    GET_ASSET_DATA,
    contractAddress,
    tokenId,
  ]);

  const hasChainDiff =
    provider !== undefined &&
    typeof window !== 'undefined' &&
    assetCached?.data?.chainId !== chainId;

  return useQuery(
    [GET_ASSET_DATA, contractAddress, tokenId],
    async () => {
      if (
        chainId === undefined ||
        provider === undefined ||
        contractAddress === undefined ||
        tokenId === undefined
      ) {
        return;
      }

      return await getAssetData(provider, contractAddress, tokenId);
    },
    {
      ...options,
      refetchOnMount: false,
      refetchOnWindowFocus: Boolean(lazy) === true && isActive,
      enabled:
        !hasChainDiff ||
        (isActive &&
          lazy !== undefined &&
          lazy &&
          contractAddress !== undefined &&
          tokenId !== undefined),
    }
  );
}

export function useFullAsset({
  address,
  id,
}: {
  address?: string;
  id?: string;
}) {
  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  if (asset && metadata) {
    return { ...asset, metadata } as Asset;
  }
}

export const GET_COLLECTION_DATA = 'GET_COLLECTION_DATA';

export function useCollection(contractAddress?: string, chainId?: ChainId) {
  const { provider, chainId: chainProvider } = useWeb3React();

  return useQuery(
    [GET_COLLECTION_DATA, contractAddress, chainId],
    async () => {
      if (
        chainId === undefined ||
        provider === undefined ||
        contractAddress === undefined ||
        chainProvider === undefined
      ) {
        return;
      }

      return await getCollectionData(provider, contractAddress);
    },
    {
      enabled: provider !== undefined && chainId === chainProvider,
      refetchOnMount: false,
    }
  );
}

export const GET_ASSET_METADATA = 'GET_ASSET_METADATA';

export function useAssetMetadata(
  asset?: Asset,
  options?: Omit<UseQueryOptions, any>
) {
  return useQuery<AssetMetadata | undefined>(
    [GET_ASSET_METADATA, asset?.tokenURI],
    async () => {
      if (asset?.tokenURI === undefined) {
        return;
      }

      return await getAssetMetadata(asset?.tokenURI, {
        image: '',
        name: `${asset.collectionName} #${asset.id}`,
      });
    },
    { ...options, enabled: asset?.tokenURI !== undefined }
  );
}

export function useSwapSdkV4(provider: any, chainId?: number) {
  return useMemo(() => {
    if (chainId === undefined || provider === undefined) {
      return undefined;
    }

    return new NftSwapV4(provider, provider.getSigner(), chainId);
  }, [provider, chainId]);
}

export function useApproveAssetMutation(
  nftSwapSdk?: NftSwapV4,
  address?: string,
  onSuccess?: (hash: string, asset: SwappableAssetV4) => void,
  options?: Omit<UseMutationOptions, any>
) {
  const mutation = useMutation(
    async ({ asset }: { asset: SwappableAssetV4 }) => {
      if (address === undefined || nftSwapSdk === undefined) {
        return undefined;
      }

      const tx = await nftSwapSdk.approveTokenOrNftByAsset(asset, address);

      if (onSuccess) {
        onSuccess!(tx.hash, asset);
      }

      const receipt = await tx.wait();

      return receipt.status === 1 && receipt.confirmations >= 1;
    },
    options
  );

  return mutation;
}

export const GET_ASSET_APPROVAL = 'GET_ASSET_APPROVAL';

export function useIsAssetApproved(
  nftSwapSdk?: NftSwapV4,
  asset?: SwappableAssetV4,
  address?: string
) {
  return useQuery(
    [GET_ASSET_APPROVAL, nftSwapSdk, address, asset],
    async () => {
      if (
        address === undefined ||
        nftSwapSdk === undefined ||
        asset === undefined
      ) {
        return undefined;
      }

      return await nftSwapSdk?.loadApprovalStatus(asset, address);
    }
  );
}

export function useMakeOfferMutation(
  nftSwapSdk?: NftSwapV4,
  address?: string,
  chainId?: number,
  options?: UseMutationOptions<PostOrderResponsePayload | undefined, any, any>
) {
  const tokens = useTokenList({ chainId });

  const mutation = useMutation<PostOrderResponsePayload | undefined, any, any>(
    async ({
      assetOffer,
      another,
      expiry,
    }: {
      assetOffer: SwappableNftV4;
      another: SwappableAssetV4;
      expiry?: number | Date | undefined;
    }) => {
      if (address === undefined || nftSwapSdk === undefined) {
        return undefined;
      }

      if (assetOffer.type !== 'ERC721' || another.type !== 'ERC20') {
        return;
      }

      let options: any = {
        expiry,
      };

      const token = tokens.find((t) =>
        isAddressEqual(t.address, another.tokenAddress)
      );

      if (appConfig.fees && token) {
        options.fees = calculeFees(
          BigNumber.from(another.amount),
          token.decimals,
          appConfig.fees
        );
      }


      const order = nftSwapSdk.buildOrder(
        another,
        assetOffer,
        address,
        options
      );

      const signedOrder = await nftSwapSdk.signOrder(order);

      const newOrder = await nftSwapSdk.postOrder(
        signedOrder,
        nftSwapSdk.chainId.toString()
      );

      return newOrder;
    },
    options
  );

  return mutation;
}

export function useMakeListingMutation(
  nftSwapSdk?: NftSwapV4,
  address?: string,
  chainId?: number,
  options?: UseMutationOptions<PostOrderResponsePayload | undefined, any, any>
) {
  const tokens = useTokenList({ includeNative: true, chainId });

  const mutation = useMutation<PostOrderResponsePayload | undefined, any, any>(
    async ({ assetOffer, another, expiry, taker }: any) => {
      if (address === undefined || nftSwapSdk === undefined) {
        return undefined;
      }

      let options: any = {
        expiry,
        taker,
      };

      const token = tokens.find((t) =>
        isAddressEqual(t.address, another.tokenAddress)
      );

      if (appConfig.fees && token) {
        options.fees = calculeFees(
          BigNumber.from(another.amount),
          token.decimals,
          appConfig.fees
        );
      }

      const order = nftSwapSdk.buildOrder(
        assetOffer,
        another,
        address,
        options
      );

      const signedOrder = await nftSwapSdk.signOrder(order);

      const newOrder = await nftSwapSdk.postOrder(
        signedOrder,
        nftSwapSdk.chainId.toString()
      );

      return newOrder;
    },
    options
  );

  return mutation;
}

export function useCancelSignedOrderMutation(
  nftSwapSdk?: NftSwapV4,
  orderType?: 'ERC721' | 'ERC1155', // TODO: types
  onHash?: (hash: string, order: SwapApiOrder) => void,
  options?: Omit<UseMutationOptions, any>
) {
  return useMutation<any, any, any>(
    async ({ order }: { order: SwapApiOrder }) => {
      if (orderType === undefined || nftSwapSdk === undefined) {
        return undefined;
      }

      const tx = await nftSwapSdk.cancelOrder(order.nonce, orderType);

      if (onHash) {
        onHash!(tx.hash, order);
      }

      return await tx.wait();
    },
    options
  );
}

export function useFillSignedOrderMutation(
  nftSwapSdk?: NftSwapV4,
  address?: string,
  options?: Omit<UseMutationOptions, any>
) {
  return useMutation(
    async ({
      order,
      accept = false,
    }: {
      accept?: boolean;
      order: SwapApiOrder;
    }) => {
      if (address === undefined || nftSwapSdk === undefined) {
        return undefined;
      }

      const result = await nftSwapSdk.fillSignedOrder(order, {});

      return { hash: result?.hash, accept, order };
    },
    options
  );
}

export const GET_ERC20_BALANCE = 'GET_ERC20_BALANCE';

export function useErc20Balance(
  provider?: ethers.providers.BaseProvider,
  contractAddress?: string,
  account?: string
) {
  return useQuery<ethers.BigNumber | undefined>(
    [GET_ERC20_BALANCE, contractAddress, account],
    async () => {
      if (!contractAddress || !account || !provider) {
        return undefined;
      }

      return getERC20Balance(contractAddress, account, provider);
    },
    {
      enabled: contractAddress !== undefined && account !== undefined,
    }
  );
}

export function useWrapEtherMutation(
  provider?: ethers.providers.BaseProvider,
  chainId?: number
) {
  return useMutation(async ({ amount }: { amount: ethers.BigNumber }) => {
    if (chainId === undefined) {
      return;
    }

    const contractAddress = WRAPPED_ETHER_CONTRACT[chainId];

    if (contractAddress === undefined) {
      return;
    }

    const contract = new ethers.Contract(contractAddress, WETHAbi, provider);

    return await contract.deposit({ value: amount });
  });
}
export const GET_NFT_ORDERS = 'GET_NFT_ORDERS';

export const useOrderBook = (orderFilter: TraderOrderFilter) => {
  return useQuery(
    [GET_NFT_ORDERS, orderFilter],
    async () => {
      if (orderFilter.chainId === undefined) {
        return;
      }

      return await getOrderbookOrders(orderFilter);
    },
    { enabled: orderFilter.chainId !== undefined, suspense: true }
  );
};

export const GET_ASSET_LIST_FROM_ORDERBOOK = 'GET_ASSET_LIST_FROM_ORDERBOOK';

export const useAssetListFromOrderbook = (orderFilter: TraderOrderFilter) => {
  const ordebookQuery = useOrderBook(orderFilter);
  const { provider } = useWeb3React();

  return useQuery(
    [GET_ASSET_LIST_FROM_ORDERBOOK, ordebookQuery.data],
    async () => {
      if (ordebookQuery.data === undefined || provider === undefined) {
        return;
      }
      // We are mapping Collections ---> nft token id's ---> orders
      const orderItemsMap = new Map<string, Map<string, OrderBookItem>>();
      const orders = ordebookQuery.data.orders;
      for (const order of orders) {
        const orderKey = `${order.nftToken}`;
        if (orderItemsMap.has(orderKey)) {
          const collectionMap = orderItemsMap.get(orderKey) as Map<
            string,
            OrderBookItem
          >;
          if (collectionMap.has(order.nftTokenId)) {
            const or = collectionMap.get(order.nftTokenId) as OrderBookItem;
            or.orders?.push(or.order);
            collectionMap.set(order.nftTokenId, or);
            orderItemsMap.set(orderKey, collectionMap);
          } else {
            collectionMap.set(order.nftTokenId, {
              ...order,
              orders: [order.order],
            });
            orderItemsMap.set(orderKey, collectionMap);
          }
        } else {
          const initNFTmap = new Map<string, OrderBookItem>();
          initNFTmap.set(order.nftTokenId, {
            ...order,
            orders: [order.order],
          });
          orderItemsMap.set(orderKey, initNFTmap);
        }
      }
      let assets: Asset[] = [];
      const collections = Array.from(orderItemsMap.keys());

      for (const collection of collections) {
        const itensCollectionMap = orderItemsMap.get(collection) as Map<
          string,
          OrderBookItem
        >;
        const itensCollection = Array.from(itensCollectionMap.values());
        const nftType = itensCollection[0].nftType;
        const nfts = await getAssetsData(
          provider,
          collection,
          itensCollection.map((or) => or.nftTokenId),
          nftType === NFTType.ERC1155
        );
        if (nfts) {
          assets = assets.concat(nfts);
        }
      }
      return assets;
    },
    { enabled: provider !== undefined, suspense: true }
  );
};

export const GET_ASSET_METADATA_FROM_LIST = 'GET_ASSET_METADATA_FROM_LIST';

export const useAssetMetadataFromList = (orderFilter: TraderOrderFilter) => {
  const assetListQuery = useAssetListFromOrderbook(orderFilter);
  return useQuery(
    [GET_ASSET_METADATA_FROM_LIST, assetListQuery.data],
    async () => {
      if (!assetListQuery.data) {
        return;
      }
      const data = assetListQuery.data;
      const assetMetadata: Asset[] = [];

      for (let index = 0; index < data.length; index++) {
        const asset = data[index];
        const metadata = await getAssetMetadata(asset.tokenURI);
        assetMetadata.push({
          ...asset,
          metadata: metadata,
        });
      }
      return assetMetadata;
    },
    { suspense: true }
  );
};

export function useFavoriteAssets() {
  const [assets, setAssets] = useAtom(assetsAtom);

  const add = (asset: Asset) => {
    setAssets((value) => ({
      ...value,
      [`${asset.chainId}-${asset.contractAddress?.toLowerCase()}-${asset.id}`]:
        asset,
    }));
  };

  const remove = (asset: Asset) => {
    setAssets((value) => {
      let tempValue = { ...value };

      delete tempValue[
        `${asset.chainId}-${asset.contractAddress?.toLowerCase()}-${asset.id}`
      ];

      return tempValue;
    });
  };

  const isFavorite = useCallback(
    (asset?: Asset) => {
      return (
        asset !== undefined &&
        assets !== undefined &&
        assets[
        `${asset.chainId}-${asset.contractAddress.toLowerCase()}-${asset.id}`
        ] !== undefined
      );
    },
    [assets]
  );

  const toggleFavorite = (asset?: Asset) => {
    if (asset !== undefined) {
      if (isFavorite(asset)) {
        remove(asset);
      } else {
        add(asset);
      }
    }
  };

  return { add, remove, assets, isFavorite, toggleFavorite };
}

export const ASSETS_FROM_ORDERBOOK = 'ASSETS_FROM_ORDERBOOK';

export function useAssetsFromOrderbook(filters: TraderOrderFilter) {
  const { provider, chainId } = useWeb3React();

  const isProviderEnabled =
    provider !== undefined &&
    chainId !== undefined &&
    chainId == filters.chainId;

  return useQuery(
    [ASSETS_FROM_ORDERBOOK, filters],
    () => {
      if (provider === undefined) {
        return;
      }

      return getAssetsFromOrderbook(provider, filters);
    },
    { enabled: isProviderEnabled }
  );
}
