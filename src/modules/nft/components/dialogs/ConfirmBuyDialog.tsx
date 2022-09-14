import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { AppDialogTitle } from '../../../../components/AppDialogTitle';

import { Box } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useMemo } from 'react';
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl';
import { useCoinPricesQuery, useCurrency } from '../../../../hooks/currency';
import { useErc20Balance } from '../../../../hooks/nft';
import { Token } from '../../../../types/blockchain';
import { Asset, AssetMetadata } from '../../../../types/nft';
import { isAddressEqual } from '../../../../utils/blockchain';
import { ipfsUriToUrl } from '../../../../utils/ipfs';

interface Props {
  tokens: Token[];
  order?: any;
  dialogProps: DialogProps;
  account?: string;
  asset?: Asset;
  metadata?: AssetMetadata;
  onConfirm: () => void;
}

export function ConfirmBuyDialog({
  tokens,
  dialogProps,
  onConfirm,
  order,
  asset,
  metadata,
}: Props) {
  const { onClose } = dialogProps;

  const { formatMessage } = useIntl();

  const currency = useCurrency();

  const { provider, account } = useWeb3React();

  const erc20Balance = useErc20Balance(provider, order?.erc20Token, account);

  const handleClose = () => onClose!({}, 'backdropClick');

  const token = useMemo(() => {
    if (order) {
      const tokenIndex = tokens.findIndex((t) =>
        isAddressEqual(t.address, order?.erc20Token)
      );

      if (tokenIndex > -1) {
        return tokens[tokenIndex];
      }
    }
  }, [tokens, order]);

  const hasSufficientFunds = useMemo(() => {
    if (token !== undefined) {
      const orderTokenAmount: ethers.BigNumber = ethers.BigNumber.from(
        order?.erc20TokenAmount
      );

      if (erc20Balance.data?.gte(orderTokenAmount)) {
        return true;
      }
    }

    return false;
  }, [erc20Balance, tokens, order]);

  const coinPricesQuery = useCoinPricesQuery({ includeNative: true });

  const totalInCurrency = useMemo(() => {
    if (token && currency && order) {
      if (coinPricesQuery?.data) {
        const ratio =
          coinPricesQuery.data[token.address.toLowerCase()][currency];

        if (ratio) {
          return (
            ratio *
            parseFloat(
              ethers.utils.formatUnits(order?.erc20TokenAmount, token.decimals)
            )
          );
        } else {
          return 0;
        }
      }
    }
  }, [token, coinPricesQuery, currency, order]);

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="buy.asset"
            defaultMessage="Buy Asset"
            description="Buy asset title"
          />
        }
        onClose={handleClose}
      />

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                {metadata?.image === undefined ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{ paddingTop: '100%', width: '100%' }}
                  />
                ) : (
                  <Image
                    width="100%"
                    height="100%"
                    alt={formatMessage({
                      id: 'nft.image',
                      defaultMessage: 'NFT Image',
                    })}
                    src={ipfsUriToUrl(metadata?.image)}
                  />
                )}
              </Grid>
              <Grid item xs>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {asset?.collectionName === undefined ? (
                        <Skeleton />
                      ) : (
                        asset?.collectionName
                      )}
                    </Typography>
                    <Typography variant="subtitle1">
                      {metadata?.name === undefined ? (
                        <Skeleton />
                      ) : (
                        metadata?.name
                      )}
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      <FormattedMessage
                        id="listing.price"
                        defaultMessage="Listing price"
                      />
                    </Typography>
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
                      <Typography sx={{ fontWeight: 600 }} variant="body1">
                        {ethers.utils.formatUnits(
                          ethers.BigNumber.from(order?.erc20TokenAmount || '0'),
                          token?.decimals
                        )}{' '}
                        {token?.symbol}
                      </Typography>
                      {totalInCurrency !== undefined && (
                        <Chip
                          size="small"
                          label={
                            <Typography variant="caption">
                              {totalInCurrency ? (
                                <>
                                  <FormattedNumber
                                    value={totalInCurrency}
                                    currency={currency}
                                  />{' '}
                                  {currency.toUpperCase()}
                                </>
                              ) : (
                                <Skeleton />
                              )}
                            </Typography>
                          }
                        />
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Stack
              spacing={1}
              direction="row"
              alignItems="center"
              alignContent="center"
              justifyContent="flex-end"
            >
              <Typography variant="body1">
                <FormattedMessage
                  id="available.balance"
                  defaultMessage="Available balance"
                />
                :
              </Typography>
              <Stack
                spacing={0.5}
                direction="row"
                alignItems="center"
                alignContent="center"
              >
                <Tooltip title={token?.name || ''}>
                  <img
                    alt={token?.name}
                    src={ipfsUriToUrl(token?.logoURI || '')}
                    style={{ width: 'auto', height: '1rem' }}
                  />
                </Tooltip>
                <Typography sx={{ fontWeight: 600 }} variant="body1">
                  {erc20Balance.isLoading ? (
                    <Skeleton />
                  ) : (
                    ethers.utils.formatUnits(
                      erc20Balance.data || ethers.BigNumber.from(0),
                      token?.decimals
                    )
                  )}{' '}
                  {token?.symbol}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          {!hasSufficientFunds && (
            <Grid item xs={12}>
              <Alert severity="error">
                <FormattedMessage
                  defaultMessage="Insufficient Funds"
                  description="insufficient funds"
                  id="insufficient.funds"
                />
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!hasSufficientFunds}
          onClick={onConfirm}
          variant="contained"
          color="primary"
        >
          <FormattedMessage defaultMessage="Buy" description="Buy" id="buy" />
        </Button>
        <Button onClick={handleClose}>
          <FormattedMessage
            defaultMessage="Cancel"
            id="cancel"
            description="Cancel"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
