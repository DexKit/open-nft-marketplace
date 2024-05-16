import {
  Alert,
  Box,
  Button,
  Chip,
  NoSsr,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import type { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { useWeb3React } from '@web3-react/core';
import { utils, BigNumber, constants } from 'ethers';
import moment from 'moment';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import AppFeePercentageSpan from '../../../components/AppFeePercentageSpan';
import Calendar from '../../../components/icons/Calendar';
import Link from '../../../components/Link';
import { ZEROEX_NATIVE_TOKEN_ADDRESS } from '../../../constants';
import { useTransactions } from '../../../hooks/app';
import { useSwitchNetwork, useTokenList } from '../../../hooks/blockchain';
import { useCoinPricesQuery, useCurrency } from '../../../hooks/currency';
import {
  useApproveAssetMutation,
  useAsset,
  useAssetMetadata,
  useCancelSignedOrderMutation,
  useFillSignedOrderMutation,
  useSwapSdkV4,
} from '../../../hooks/nft';
import {
  getERC20Decimals,
  getERC20Name,
  getERC20Symbol,
} from '../../../services/balances';
import {
  AcceptTransactionMetadata,
  BuyTransactionMetadata,
  CancelTransactionMetadata,
  TransactionType,
} from '../../../types/blockchain';
import { OrderBookItem, SwapApiOrder } from '../../../types/nft';
import {
  getBlockExplorerUrl,
  getNetworkSlugFromChainId,
  isAddressEqual,
  truncateAddress,
} from '../../../utils/blockchain';
import { ipfsUriToUrl } from '../../../utils/ipfs';
import { OrderPageActions } from './OrderPageActions';

interface Props {
  order?: OrderBookItem;
}

function OrderRightSection({ order }: Props) {
  const { account, provider, chainId } = useWeb3React();
  const { data: asset } = useAsset(order?.nftToken, order?.nftTokenId);
  const { data: metadata } = useAssetMetadata(asset);

  const tokens = useTokenList({ includeNative: true, chainId: asset?.chainId });

  const currency = useCurrency();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const token = useMemo(() => {
    return tokens.find((t) => isAddressEqual(t.address, order?.erc20Token));
  }, [tokens, order]);

  const transactions = useTransactions();

  const nftSwapSdk = useSwapSdkV4(provider, chainId);

  const switchNetwork = useSwitchNetwork();

  const coinPricesQuery = useCoinPricesQuery({ includeNative: true });

  const amountFormatted = useMemo(() => {
    if (order && token) {
      return utils.formatUnits(
        BigNumber.from(order?.erc20TokenAmount || '0'),
        token?.decimals
      );
    }
  }, [token, order]);

  const totalInCurrency = useMemo(() => {
    if (token && currency && order) {
      if (coinPricesQuery?.data) {
        let ratio = 0;

        const tokenData = coinPricesQuery.data[token.address.toLowerCase()];

        if (tokenData && currency in tokenData) {
          ratio = tokenData[currency];
        }

        if (ratio) {
          return (
            ratio *
            parseFloat(
              utils.formatUnits(order?.erc20TokenAmount, token.decimals)
            )
          );
        } else {
          return 0;
        }
      }
    }
  }, [token, coinPricesQuery, currency, order]);

  const handleCancelSignedOrderError = useCallback(
    (error: any) => transactions.setDialogError(error),
    [transactions]
  );

  const handleCancelOrderHash = useCallback(
    (hash: string, order: SwapApiOrder) => {
      if (asset !== undefined) {
        const metadata = { asset, order };
        transactions.setRedirectUrl(
          `/asset/${getNetworkSlugFromChainId(asset?.chainId)}/${
            asset?.contractAddress
          }/${asset?.id}`
        );

        transactions.addTransaction(hash, TransactionType.CANCEL, metadata);
      }
    },
    [transactions, asset]
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

      transactions.setRedirectUrl(
        `/asset/${getNetworkSlugFromChainId(asset?.chainId)}/${
          asset?.contractAddress
        }/${asset?.id}`
      );

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
    },
    [transactions, provider, asset]
  );

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
          const name = await getERC20Name(swapAsset.tokenAddress, provider);

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
      onMutate: (variable: { asset: SwappableAssetV4 }) => {
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
            transactions.showDialog(
              true,
              { asset: asset },
              TransactionType.APPROVE
            );
          }
        }
      },
    }
  );

  const fillSignedOrder = useFillSignedOrderMutation(nftSwapSdk, account, {
    onSuccess: handleBuyOrderSuccess,
    onError: handleFillSignedOrderError,
    onMutate: handleMutateSignedOrder,
  });

  const cancelSignedOrder = useCancelSignedOrderMutation(
    nftSwapSdk,
    'ERC721',
    handleCancelOrderHash,
    {
      onError: handleCancelSignedOrderError,
      onMutate: handleCancelSignedOrderMutate,
    }
  );

  const handleCancelOrder = useCallback(async () => {
    if (
      asset?.chainId !== undefined &&
      chainId !== undefined &&
      order !== undefined
    ) {
      if (chainId !== asset?.chainId) {
        switchNetwork.openDialog(asset?.chainId);
      } else {
        await cancelSignedOrder.mutateAsync({ order: order.order });
      }
    }
  }, [cancelSignedOrder, switchNetwork, chainId, asset, order]);

  const handleAcceptOffer = useCallback(async () => {
    if (!account) {
      return;
    }

    const asset: any = {
      tokenAddress: order?.nftToken,
      tokenId: order?.nftTokenId,
      type: 'ERC721',
    };

    const status = await nftSwapSdk?.loadApprovalStatus(asset, account);

    if (!status?.contractApproved) {
      await approveAsset.mutateAsync({
        asset,
      });
    }

    if (order) {
      fillSignedOrder.mutateAsync({
        order: order?.order,
        accept: true,
      });
    }
  }, [fillSignedOrder, nftSwapSdk, order, account, approveAsset]);

  const handleBuy = useCallback(async () => {
    if (!account || order?.order === undefined) {
      return;
    }

    if (!isAddressEqual(order?.erc20Token, ZEROEX_NATIVE_TOKEN_ADDRESS)) {
      const asset: any = {
        tokenAddress: order.erc20Token,
        tokenAmount: order.erc20TokenAmount,
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
      order: order.order,
    });
  }, [transactions, fillSignedOrder, nftSwapSdk, account, order, approveAsset]);

  const renderActionButton = () => {
    if (isAddressEqual(order?.order.maker, account)) {
      return (
        <Button
          fullWidth={isMobile}
          onClick={handleCancelOrder}
          variant="contained"
          color="primary"
        >
          <FormattedMessage
            id="cancel.listing"
            defaultMessage="Cancel listing"
          />
        </Button>
      );
    } else {
      if (isAddressEqual(account, asset?.owner)) {
        return (
          <Button
            fullWidth={isMobile}
            variant="contained"
            color="primary"
            onClick={handleAcceptOffer}
          >
            <FormattedMessage id="accept" defaultMessage="Accept" />
          </Button>
        );
      }

      return (
        <Button
          onClick={handleBuy}
          fullWidth={isMobile}
          variant="contained"
          color="primary"
        >
          <FormattedMessage id="buy.now" defaultMessage="Buy now" />
        </Button>
      );
    }
  };

  const isOrderExpired = useMemo(() => {
    return moment.unix(parseInt(order?.order.expiry || '0')).isBefore(moment());
  }, [order]);

  const renderStatus = () => {
    if (isOrderExpired) {
      return (
        <Chip
          variant="outlined"
          label={<FormattedMessage id="expired" defaultMessage="Expired" />}
          color="error"
        />
      );
    }

    return <Chip label="Open" />;
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="textSecondary">
          {asset?.collectionName}
        </Typography>
        <Typography variant="h5" component="h1">
          {metadata?.name !== '' && metadata?.name !== undefined
            ? metadata?.name
            : `${asset?.collectionName} #${asset?.id}`}
        </Typography>
      </Box>
      {asset && (
        <NoSsr>
          <OrderPageActions
            address={asset.contractAddress}
            id={asset.id}
            nonce={order?.order.nonce}
          />
        </NoSsr>
      )}
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
        >
          <Typography sx={{ fontWeight: 400 }} variant="h6" component="h1">
            <FormattedMessage id="order" defaultMessage="Order" /> #
            {order?.order?.nonce.substring(order?.order?.nonce.length - 8)}
          </Typography>

          {renderStatus()}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
        >
          <Typography color="textSecondary" variant="body2">
            <FormattedMessage id="price" defaultMessage="Price" />
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            alignContent="center"
            spacing={1}
          >
            <Stack
              direction="row"
              alignItems="center"
              alignContent="center"
              spacing={0.5}
            >
              <Tooltip title={token?.name || ''}>
                <img
                  alt={token?.name}
                  src={ipfsUriToUrl(token?.logoURI || '')}
                  style={{ width: 'auto', height: '1rem' }}
                />
              </Tooltip>
              <Typography sx={{ fontWeight: 600 }} variant="h6">
                {amountFormatted} {token?.symbol}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={`${totalInCurrency} ${currency.toUpperCase()}`}
            />
          </Stack>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
        >
          <Typography color="textSecondary" variant="body2">
            <FormattedMessage id="expires.in" defaultMessage="Expires In" />
          </Typography>

          <Chip
            icon={<Calendar />}
            sx={{ fontWeight: 600 }}
            label={moment
              .unix(parseInt(order?.order.expiry || '0'))
              .format('LLL')}
          />
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
        >
          <Typography color="textSecondary" variant="body2">
            <FormattedMessage id="created.by" defaultMessage="Created by" />
          </Typography>

          <Link
            href={`${getBlockExplorerUrl(asset?.chainId)}/address/${
              order?.order.maker
            }`}
            variant="body2"
            target="_blank"
          >
            {truncateAddress(order?.order.maker)}
          </Link>
        </Stack>
      </Paper>
      {!isAddressEqual(order?.order.taker, constants.AddressZero) && (
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            alignContent="center"
          >
            <Typography color="textSecondary" variant="body2">
              <FormattedMessage id="visible.for" defaultMessage="Visible for" />
            </Typography>
            <Link
              href={`${getBlockExplorerUrl(asset?.chainId)}/address/${
                asset?.owner
              }`}
              variant="body2"
              target="_blank"
            >
              {truncateAddress(order?.order.taker)}
            </Link>
          </Stack>
        </Paper>
      )}
      <Alert severity="info">
        <FormattedMessage
          id="the.buyer.will.pay.percentage.in.fees"
          defaultMessage="
                The buyer will pay {amount} {symbol} + {percentage} in fees"
          values={{
            percentage: (
              <b>
                <AppFeePercentageSpan />
              </b>
            ),
            amount: amountFormatted,
            symbol: token?.symbol,
          }}
        />
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {renderActionButton()}
      </Box>
    </Stack>
  );
}

export default OrderRightSection;
