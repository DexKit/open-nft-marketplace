import {
  Button,
  Grid,
  NoSsr,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

import { QueryErrorResetBoundary, useQueryClient } from 'react-query';
import { ZEROEX_NATIVE_TOKEN_ADDRESS } from '../../../constants';

import {
  GET_NFT_ORDERS,
  useApproveAssetMutation,
  useAsset,
  useAssetMetadata,
  useCancelSignedOrderMutation,
  useFillSignedOrderMutation,
  useSwapSdkV4,
} from '../../../hooks/nft';
import {
  getNetworkSlugFromChainId,
  isAddressEqual,
} from '../../../utils/blockchain';
import { ConfirmBuyDialog } from './dialogs/ConfirmBuyDialog';
import TableSkeleton from './tables/TableSkeleton';

import { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { useTransactions } from '../../../hooks/app';
import { useSwitchNetwork, useTokenList } from '../../../hooks/blockchain';
import {
  getERC20Decimals,
  getERC20Name,
  getERC20Symbol,
} from '../../../services/balances';
import {
  AcceptTransactionMetadata,
  ApproveTransactionMetadata,
  BuyTransactionMetadata,
  CancelTransactionMetadata,
  TransactionType,
} from '../../../types/blockchain';
import { SwapApiOrder } from '../../../types/nft';
import { getWindowUrl } from '../../../utils/browser';
import ShareDialog from './dialogs/ShareDialog';

const ListingsTable = dynamic(() => import('./tables/ListingsTable'), {
  ssr: false,
  suspense: true,
});

const OffersTable = dynamic(() => import('./tables/OffersTable'), {
  ssr: false,
  suspense: true,
});

enum AssetTabsOptions {
  Listings,
  Offers,
}

interface Props {
  address: string;
  id: string;
}

export function AssetTabs({ address, id }: Props) {
  const { account, provider, chainId } = useWeb3React();

  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  const [selectedTab, setSelectedTab] = useState<AssetTabsOptions>(
    AssetTabsOptions.Listings
  );

  const transactions = useTransactions();

  const nftSwapSdk = useSwapSdkV4(provider, chainId);

  const handleApproveAsset = useCallback(
    async (hash: string, swapAsset: SwappableAssetV4) => {
      if (asset !== undefined) {
        if (swapAsset.type === 'ERC721' || swapAsset.type === 'ERC1155') {
          transactions.addTransaction(hash, TransactionType.APPROVAL_FOR_ALL, {
            asset: asset,
          });
        } else {
          const decimals = await getERC20Decimals(
            swapAsset.tokenAddress,
            provider
          );

          const symbol = await getERC20Symbol(swapAsset.tokenAddress, provider);
          const name = await getERC20Symbol(swapAsset.tokenAddress, provider);

          transactions.addTransaction(hash, TransactionType.APPROVE, {
            amount: swapAsset.amount,
            symbol,
            decimals,
            name,
          });
        }
      }
    },
    [transactions, provider, asset]
  );

  const approveAsset = useApproveAssetMutation(
    nftSwapSdk,
    account,
    handleApproveAsset,
    {
      onError: (error: any) => transactions.setDialogError(error),
      onMutate: async (variable: { asset: SwappableAssetV4 }) => {
        if (asset) {
          if (
            variable.asset.type === 'ERC721' ||
            variable.asset.type === 'ERC1155'
          ) {
            transactions.showDialog(
              true,
              { asset: asset },
              TransactionType.APPROVAL_FOR_ALL
            );
          } else {
            const decimals = await getERC20Decimals(
              asset.contractAddress,
              provider
            );

            const symbol = await getERC20Symbol(
              asset.contractAddress,
              provider
            );

            const name = await getERC20Name(asset.contractAddress, provider);

            transactions.showDialog(
              true,
              {
                amount: variable.asset.amount,
                decimals,
                symbol,
                name,
              } as ApproveTransactionMetadata,
              TransactionType.APPROVE
            );
          }
        }
      },
    }
  );

  const handleBuyOrderSuccess = useCallback(
    async ({
      hash,
      accept,
      order,
    }: {
      hash: string;
      accept: boolean;
      order: SwapApiOrder;
    }) => {
      if (provider === undefined || asset === undefined) {
        return;
      }

      const decimals = await getERC20Decimals(order.erc20Token, provider);

      const symbol = await getERC20Symbol(order.erc20Token, provider);

      if (accept) {
        transactions.addTransaction(hash, TransactionType.ACCEPT, {
          asset,
          order,
          tokenDecimals: decimals,
          symbol,
        } as AcceptTransactionMetadata);
      } else {
        transactions.addTransaction(hash, TransactionType.BUY, {
          asset,
          order,
          tokenDecimals: decimals,
          symbol,
        } as BuyTransactionMetadata);
      }

      queryClient.invalidateQueries(GET_NFT_ORDERS);
    },
    [transactions, provider, asset]
  );

  const handleFillSignedOrderError = useCallback(
    (error: any) => transactions.setDialogError(error),
    [transactions]
  );

  const handleMutateSignedOrder = useCallback(
    async ({ order, accept }: { order: SwapApiOrder; accept?: boolean }) => {
      if (asset && order) {
        const decimals = await getERC20Decimals(order.erc20Token, provider);

        const symbol = await getERC20Symbol(order.erc20Token, provider);

        if (accept) {
          const metadata = {
            asset,
            order,
            tokenDecimals: decimals,
            symbol,
          } as AcceptTransactionMetadata;

          return transactions.showDialog(
            true,
            metadata,
            TransactionType.ACCEPT
          );
        }

        const metadata = {
          asset,
          order,
          tokenDecimals: decimals,
          symbol,
        } as BuyTransactionMetadata;

        transactions.showDialog(true, metadata, TransactionType.BUY);
      }
    },
    [transactions, asset]
  );

  const fillSignedOrder = useFillSignedOrderMutation(nftSwapSdk, account, {
    onSuccess: handleBuyOrderSuccess,
    onError: handleFillSignedOrderError,
    onMutate: handleMutateSignedOrder,
  });

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: AssetTabsOptions
  ) => {
    setSelectedTab(newValue);
  };

  const [openConfirmBuy, setOpenConfirmBuy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>();
  const [openShare, setOpenShare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>();

  const queryClient = useQueryClient();

  const handleInvalidateCache = () => {
    queryClient.invalidateQueries(GET_NFT_ORDERS);
  };

  const handleCloseConfirmBuy = () => {
    setSelectedOrder(undefined);
    setOpenConfirmBuy(false);
  };

  const handleCancelOrderHash = useCallback(
    (hash: string, order: SwapApiOrder) => {
      if (asset !== undefined) {
        const metadata = { asset, order };

        transactions.addTransaction(hash, TransactionType.CANCEL, metadata);
      }
    },
    [transactions, asset]
  );

  const handleCancelSignedOrderError = useCallback(
    (error: any) => transactions.setDialogError(error),
    [transactions]
  );

  const handleCancelSignedOrderMutate = useCallback(
    ({ order }: { order: SwapApiOrder }) => {
      if (asset !== undefined) {
        const metadata: CancelTransactionMetadata = { asset, order };

        transactions.showDialog(true, metadata, TransactionType.CANCEL);
      }
    },
    [transactions]
  );

  const cancelSignedOrder = useCancelSignedOrderMutation(
    nftSwapSdk,
    'ERC721',
    handleCancelOrderHash,
    {
      onError: handleCancelSignedOrderError,
      onMutate: handleCancelSignedOrderMutate,
    }
  );

  const switchNetwork = useSwitchNetwork();

  const handleBuyAsset = useCallback(
    (order: any) => {
      if (asset?.chainId !== undefined && chainId !== undefined) {
        if (chainId !== asset?.chainId) {
          switchNetwork.openDialog(asset?.chainId);
        } else {
          setSelectedOrder(order);
          setOpenConfirmBuy(true);
        }
      }
    },
    [asset, chainId, switchNetwork]
  );

  const handleConfirmBuy = useCallback(async () => {
    if (!account || selectedOrder === undefined) {
      return;
    }

    setOpenConfirmBuy(false);

    if (
      !isAddressEqual(selectedOrder.erc20Token, ZEROEX_NATIVE_TOKEN_ADDRESS)
    ) {
      const asset: any = {
        tokenAddress: selectedOrder.erc20Token,
        tokenAmount: selectedOrder.erc20TokenAmount,
        type: 'ERC20',
      };

      const status = await nftSwapSdk?.loadApprovalStatus(asset, account);

      if (!status?.contractApproved) {
        await approveAsset.mutateAsync({
          asset,
        });
      }
    }

    await fillSignedOrder.mutateAsync({
      order: selectedOrder,
    });
  }, [
    transactions,
    fillSignedOrder,
    nftSwapSdk,
    address,
    id,
    account,
    selectedOrder,
    approveAsset,
  ]);

  const handleCancelOrder = useCallback(
    async (order?: SwapApiOrder) => {
      if (
        asset?.chainId !== undefined &&
        chainId !== undefined &&
        order !== undefined
      ) {
        if (chainId !== asset?.chainId) {
          switchNetwork.openDialog(asset?.chainId);
        } else {
          await cancelSignedOrder.mutateAsync({ order });
          handleInvalidateCache();
        }
      }
    },
    [cancelSignedOrder, switchNetwork, chainId, asset]
  );

  const handleAcceptOffer = useCallback(
    async (order: any) => {
      if (!account) {
        return;
      }

      const asset: any = {
        tokenAddress: address,
        tokenId: id,
        type: 'ERC721',
      };

      const status = await nftSwapSdk?.loadApprovalStatus(asset, account);

      if (!status?.contractApproved) {
        await approveAsset.mutateAsync({
          asset,
        });
      }

      fillSignedOrder.mutateAsync({
        order,
        accept: true,
      });
    },
    [fillSignedOrder, nftSwapSdk, address, id, account, approveAsset]
  );

  const handleCloseShareDialog = () => {
    setOpenShare(false);
    setShareUrl(undefined);
  };

  const handleShareOrder = (nonce: string) => {
    if (asset) {
      setOpenShare(true);
      setShareUrl(
        `${getWindowUrl()}/order/${getNetworkSlugFromChainId(
          asset.chainId
        )}/${nonce}`
      );
    }
  };

  const tokens = useTokenList({ chainId: chainId, includeNative: true });

  return (
    <NoSsr>
      <ConfirmBuyDialog
        tokens={tokens}
        asset={asset}
        metadata={metadata}
        order={selectedOrder}
        dialogProps={{
          open: openConfirmBuy,
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleCloseConfirmBuy,
        }}
        onConfirm={() => handleConfirmBuy()}
      />
      <ShareDialog
        dialogProps={{
          open: openShare,
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleCloseShareDialog,
        }}
        url={shareUrl}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Tabs value={selectedTab} onChange={handleChangeTab}>
            <Tab
              value={AssetTabsOptions.Listings}
              label={
                <FormattedMessage id="listings" defaultMessage="Listings" />
              }
            />
            <Tab
              value={AssetTabsOptions.Offers}
              label={<FormattedMessage id="offers" defaultMessage="Offers" />}
            />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          {selectedTab === AssetTabsOptions.Listings ? (
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  fallbackRender={({ resetErrorBoundary, error }) => (
                    <Paper sx={{ p: 1 }}>
                      <Stack justifyContent="center" alignItems="center">
                        <Typography variant="h6">
                          <FormattedMessage
                            id="something.went.wrong"
                            defaultMessage="Oops, something went wrong"
                            description="Something went wrong error message"
                          />
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {String(error)}
                        </Typography>
                        <Button color="primary" onClick={resetErrorBoundary}>
                          <FormattedMessage
                            id="try.again"
                            defaultMessage="Try again"
                            description="Try again"
                          />
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                >
                  <Suspense fallback={<TableSkeleton rows={4} />}>
                    <ListingsTable
                      address={address}
                      id={id}
                      onBuy={handleBuyAsset}
                      onCancel={handleCancelOrder}
                      onShare={handleShareOrder}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          ) : (
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  fallbackRender={({ resetErrorBoundary, error }) => (
                    <Paper sx={{ p: 1 }}>
                      <Stack justifyContent="center" alignItems="center">
                        <Typography variant="h6">
                          <FormattedMessage
                            id="something.went.wrong"
                            defaultMessage="Oops, something went wrong"
                            description="Something went wrong error message"
                          />
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {String(error)}
                        </Typography>
                        <Button color="primary" onClick={resetErrorBoundary}>
                          <FormattedMessage
                            id="try.again"
                            defaultMessage="Try again"
                            description="Try again"
                          />
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                >
                  <Suspense fallback={<TableSkeleton rows={4} />}>
                    <OffersTable
                      address={address}
                      id={id}
                      onAcceptOffer={handleAcceptOffer}
                      onCancelOffer={handleCancelOrder}
                      onShare={handleShareOrder}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          )}
        </Grid>
      </Grid>
    </NoSsr>
  );
}
