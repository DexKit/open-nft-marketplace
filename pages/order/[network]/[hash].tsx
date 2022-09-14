import { Grid, Skeleton } from '@mui/material';
import Container from '@mui/material/Container';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { dehydrate, QueryClient } from 'react-query';
import MainLayout from '../../../src/components/layouts/main';
import { PageHeader } from '../../../src/components/PageHeader';
import {
  GET_ASSET_DATA,
  GET_NFT_ORDERS,
  useAsset,
  useOrderBook,
} from '../../../src/hooks/nft';
import { OrderLeftSection } from '../../../src/modules/orders/components/OrderLeftSection';
import OrderRightSection from '../../../src/modules/orders/components/OrderRightSection';
import { getAssetData, getOrderbookOrders } from '../../../src/services/nft';
import { getProviderBySlug } from '../../../src/services/providers';
import { OrderBookItem } from '../../../src/types/nft';
import {
  getChainIdFromName,
  getNetworkSlugFromChainId,
} from '../../../src/utils/blockchain';
import { TraderOrderFilter } from '../../../src/utils/types';

const OrderDetail: NextPage = () => {
  const router = useRouter();
  const { hash, network } = router.query;
  const chainId = getChainIdFromName(network as string)?.chainId;

  const { formatMessage } = useIntl();
  const query = useOrderBook({
    chainId,
    nonce: hash as string,
  });

  const firstOrder = useMemo(() => {
    if (query.data?.orders?.length === 1) {
      return query.data?.orders[0];
    }
  }, [query]);

  const { data: asset } = useAsset(
    firstOrder?.nftToken,
    firstOrder?.nftTokenId
  );

  return (
    <Container>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <PageHeader
            breadcrumbs={[
              {
                caption: <FormattedMessage id="home" defaultMessage="Home" />,
                uri: '/',
              },
              {
                caption: asset?.collectionName ? (
                  asset?.collectionName
                ) : (
                  <Skeleton />
                ),
                uri: `/collection/${getNetworkSlugFromChainId(
                  asset?.chainId
                )}/${firstOrder?.nftToken}`,
              },
              {
                caption: `${asset?.collectionName} #${asset?.id}`,
                uri: `/asset/${getNetworkSlugFromChainId(asset?.chainId)}/${
                  firstOrder?.nftToken
                }/${firstOrder?.nftTokenId}`,
              },
              {
                caption: `${formatMessage({
                  id: 'order',
                  defaultMessage: 'Order',
                })} #${firstOrder?.order?.nonce.substring(
                  firstOrder?.order.nonce.length - 8
                )}`,
                uri: `/order/${getNetworkSlugFromChainId(asset?.chainId)}/${
                  firstOrder?.order?.nonce
                }`,
                active: true,
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          {firstOrder && (
            <OrderLeftSection
              address={firstOrder?.nftToken}
              id={firstOrder?.nftTokenId}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <OrderRightSection order={firstOrder} />
        </Grid>
      </Grid>
    </Container>
  );
};

(OrderDetail as any).getLayout = function getLayout(page: any) {
  return <MainLayout>{page}</MainLayout>;
};

interface Params {
  hash: string;
  network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash, network } = context.params as unknown as Params;

  const chainId = getChainIdFromName(network)?.chainId;

  const provider = getProviderBySlug(network);

  const orderFilter: TraderOrderFilter = { chainId, nonce: hash };

  const queryClient = new QueryClient();

  const orders = await getOrderbookOrders({
    chainId,
    nonce: hash,
  });

  let order: OrderBookItem | undefined;

  if (orders?.orders.length === 1) {
    order = orders?.orders[0];
  } else {
    return {
      notFound: true,
    };
  }

  if (order) {
    const asset = getAssetData(provider, order.nftToken, order.nftTokenId);

    await queryClient.prefetchQuery(
      [GET_ASSET_DATA, order.nftToken, order.nftTokenId],
      async () => asset
    );
  }

  await queryClient.prefetchQuery(
    [GET_NFT_ORDERS, orderFilter],
    async () => orders
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default OrderDetail;
