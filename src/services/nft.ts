import { CallInput } from '@indexed-finance/multicall';
import axios from 'axios';
import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { ERC1155Abi, ERC721Abi } from '../constants/abis';
import { Asset, AssetMetadata, Collection, OrderBookItem } from '../types/nft';
import { ipfsUriToUrl } from '../utils/ipfs';
import { getMulticallFromProvider } from './multical';

import { TRADER_ORDERBOOK_API } from '../constants';
import { TraderOrderFilter } from '../utils/types';

export async function getAssetData(
  provider?: ethers.providers.JsonRpcProvider,
  contractAddress?: string,
  id?: string
): Promise<Asset | undefined> {
  if (!provider || !contractAddress || !id) {
    return;
  }

  const multicall = await getMulticallFromProvider(provider);
  const iface = new Interface(ERC721Abi);
  let calls: CallInput[] = [];
  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'ownerOf',
    args: [id],
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'tokenURI',
    args: [id],
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'name',
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'symbol',
  });

  const response = await multicall?.multiCall(calls);

  if (response) {
    const [, results] = response;
    const owner = results[0];
    const tokenURI = results[1];
    const name = results[2];
    const symbol = results[3];

    const { chainId } = await provider.getNetwork();

    return {
      owner,
      tokenURI,
      collectionName: name,
      symbol,
      id,
      contractAddress,
      chainId,
    };
  }
}

export async function getCollectionData(
  provider?: ethers.providers.JsonRpcProvider,
  contractAddress?: string
): Promise<Collection | undefined> {
  if (!provider || !contractAddress) {
    return;
  }

  const multicall = await getMulticallFromProvider(provider);
  const iface = new Interface(ERC721Abi);
  let calls: CallInput[] = [];

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'name',
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'symbol',
  });

  const response = await multicall?.multiCall(calls);
  if (response) {
    const [, results] = response;

    const name = results[0];
    const symbol = results[1];

    const { chainId } = await provider.getNetwork();

    return {
      collectionName: name,
      symbol,
      contractAddress,
      chainId,
    };
  }
}

export async function getAssetsFromOrderbook(
  provider?: ethers.providers.JsonRpcProvider,
  filters?: TraderOrderFilter
) {
  if (provider === undefined || filters?.nftToken === undefined) {
    return;
  }

  const orderbook = await getOrderbookOrders(filters);

  const ids = new Set<string>(
    orderbook.orders.map((order) => order.nftTokenId)
  );

  const assets = await getAssetsData(
    provider,
    filters.nftToken,
    Array.from(ids)
  );

  return assets;
}

//Return multiple assets at once
export async function getAssetsData(
  provider: ethers.providers.JsonRpcProvider,
  contractAddress: string,
  ids: string[],
  isERC1155 = false
): Promise<Asset[] | undefined> {
  const multicall = await getMulticallFromProvider(provider);
  const iface = new Interface(isERC1155 ? ERC1155Abi : ERC721Abi);
  let calls: CallInput[] = [];
  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'name',
  });

  calls.push({
    interface: iface,
    target: contractAddress,
    function: 'symbol',
  });
  for (let index = 0; index < ids.length; index++) {
    calls.push({
      interface: iface,
      target: contractAddress,
      function: isERC1155 ? 'uri' : 'tokenURI',
      args: [ids[index]],
    });
  }

  const response = await multicall?.multiCall(calls);
  const assets: Asset[] = [];
  if (response) {
    const { chainId } = await provider.getNetwork();
    const [, results] = response;
    const name = results[0];
    const symbol = results[1];

    for (let index = 0; index < ids.length; index++) {
      assets.push({
        tokenURI: results[index + 2],
        collectionName: name,
        symbol,
        id: ids[index],
        contractAddress,
        chainId,
      });
    }
    return assets;
  }
  return assets;
}

export async function getAssetMetadata(
  tokenURI: string,
  defaultValue?: AssetMetadata
) {
  if (tokenURI?.startsWith('data:application/json;base64')) {
    const jsonURI = Buffer.from(tokenURI.substring(29), "base64").toString();
    return JSON.parse(jsonURI);

  }

  try {
    const response = await axios.get<AssetMetadata>(
      ipfsUriToUrl(tokenURI || ''),
      {
        timeout: 5000,
      }
    );
    return response.data;
  } catch (e) {
    return defaultValue;
  }
}

export interface OrderbookResponse {
  orders: OrderBookItem[];
}

export function getOrderbookOrders(orderFilter: TraderOrderFilter) {
  return axios
    .get<OrderbookResponse>(`${TRADER_ORDERBOOK_API}`, { params: orderFilter })
    .then((resp) => resp.data);
}
