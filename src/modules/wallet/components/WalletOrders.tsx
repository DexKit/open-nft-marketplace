import { IconButton, Stack } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { SellOrBuy, TraderOrderStatus } from '../../../constants/enum';
import { useTokenList } from '../../../hooks/blockchain';
import { usePositionPaginator } from '../../../hooks/misc';
import { useAssetMetadataFromList, useOrderBook } from '../../../hooks/nft';
import WalletOrdersTable from './WalletOrdersTable';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface Props {
  filter: { sellOrBuy?: SellOrBuy; orderStatus?: TraderOrderStatus };
}

export function WalletOrders({ filter }: Props) {
  const { sellOrBuy, orderStatus } = filter;

  const { chainId, account, isActive } = useWeb3React();

  const paginator = usePositionPaginator();

  const tokens = useTokenList({ chainId, includeNative: true });

  const { data: orders } = useOrderBook({
    chainId,
    offset: paginator.position.offset,
    limit: paginator.position.limit,
    maker: account,
    sellOrBuyNft: sellOrBuy,
    status: orderStatus !== TraderOrderStatus.All ? orderStatus : undefined,
  });

  const assetsQuery = useAssetMetadataFromList({
    chainId,
    offset: paginator.position.offset,
    limit: paginator.position.limit,
    maker: account,
    sellOrBuyNft: sellOrBuy,
    status: orderStatus !== TraderOrderStatus.All ? orderStatus : undefined,
  });

  const assets = assetsQuery.data;

  const ordersWithMetadata = useMemo(() => {
    if (orders?.orders && assets && tokens) {
      return orders?.orders.map((or) => {
        return {
          ...or,
          token: tokens.find(
            (t) => or.erc20Token.toLowerCase() === t.address.toLowerCase()
          ),
          asset: assets.find(
            (a) =>
              a.id === or.nftTokenId &&
              a.contractAddress.toLowerCase() === or.nftToken.toLowerCase()
          ),
        };
      });
    }
    return [];
  }, [assets, tokens, orders]);

  return (
    <Stack>
      <WalletOrdersTable orders={ordersWithMetadata} />
      <Stack direction="row" justifyContent="flex-end">
        <IconButton
          disabled={paginator.position.offset === 0}
          onClick={paginator.handlePrevious}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton
          disabled={
            !isActive ||
            (orders !== undefined &&
              orders?.orders?.length < paginator.pageSize)
          }
          onClick={paginator.handleNext}
        >
          <NavigateNextIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default WalletOrders;
