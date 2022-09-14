import Launch from '@mui/icons-material/Launch';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { NextPage } from 'next';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import MainLayout from '../../src/components/layouts/main';
import Link from '../../src/components/Link';
import { useSignMessageDialog, useTransactions } from '../../src/hooks/app';
import {
  useApproveAssetMutation,
  useFavoriteAssets,
  useMakeListingMutation,
  useMakeOfferMutation,
  useSwapSdkV4,
} from '../../src/hooks/nft';
import { ImportAssetDialog } from '../../src/modules/orders/components/dialogs/ImportAssetDialog';
import MakeListingForm from '../../src/modules/orders/components/forms/MakeListingForm';
import MakeOfferForm from '../../src/modules/orders/components/forms/MakeOfferForm';
import {
  getERC20Decimals,
  getERC20Name,
  getERC20Symbol,
} from '../../src/services/balances';
import {
  ApproveTransactionMetadata,
  TransactionType,
} from '../../src/types/blockchain';

import { Asset } from '../../src/types/nft';
import {
  getBlockExplorerUrl,
  getChainName,
  isAddressEqual,
  truncateAddress,
} from '../../src/utils/blockchain';
import { ipfsUriToUrl } from '../../src/utils/ipfs';

import ImportExportIcon from '@mui/icons-material/ImportExport';
import { PostOrderResponsePayload } from '@traderxyz/nft-swap-sdk/dist/sdk/v4/orderbook';
import { NextSeo } from 'next-seo';
import { PageHeader } from '../../src/components/PageHeader';
import OrderCreatedDialog from '../../src/modules/orders/components/dialogs/OrderCreatedDialog';

export const OrdersIndex: NextPage = () => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [showImportAsset, setShowImportAsset] = useState(false);

  const [showOrderCreated, setShowOrderCreated] = useState(false);

  const [orderCreated, setOrderCreated] = useState<PostOrderResponsePayload>();

  const favorites = useFavoriteAssets();

  const { account, provider, chainId } = useWeb3React();
  const nftSwapSdk = useSwapSdkV4(provider, chainId);

  const signMessageDialog = useSignMessageDialog();

  const transactions = useTransactions();

  const { formatMessage } = useIntl();

  const assets = useMemo(() => {
    return Object.keys(favorites.assets).map((key) => {
      return favorites.assets[key];
    });
  }, [favorites.assets]);

  const handleChangeOption = (event: any, value: Asset | null) => {
    setAsset(value);
  };

  const handleToggleImportAsset = () => setShowImportAsset((value) => !value);

  const handleApproveAssetSuccess = useCallback(
    async (hash: string, swapAsset: SwappableAssetV4) => {
      if (asset !== null) {
        if (swapAsset.type === 'ERC721') {
          transactions.addTransaction(hash, TransactionType.APPROVAL_FOR_ALL, {
            asset,
          });
        } else if (swapAsset.type === 'ERC20') {
          const decimals = await getERC20Decimals(
            swapAsset.tokenAddress,
            provider
          );

          const symbol = await getERC20Symbol(swapAsset.tokenAddress, provider);

          transactions.addTransaction(hash, TransactionType.APPROVE, {
            amount: swapAsset.amount,
            symbol,
            decimals,
          });
        }
      }
    },
    [transactions, asset]
  );

  const handleApproveAssetMutate = useCallback(
    async (variable: { asset: SwappableAssetV4 }) => {
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
          const amount = variable.asset.amount;

          const decimals = await getERC20Decimals(
            variable.asset.tokenAddress,
            provider
          );
          const symbol = await getERC20Symbol(
            variable.asset.tokenAddress,
            provider
          );

          const name = await getERC20Name(
            variable.asset.tokenAddress,
            provider
          );

          transactions.showDialog(
            true,
            { amount, decimals, symbol, name } as ApproveTransactionMetadata,
            TransactionType.APPROVE
          );
        }
      }
    },
    [transactions, asset]
  );

  const handleApproveAssetError = useCallback(
    (error: any) => {
      transactions.setDialogError(error);
    },
    [transactions]
  );

  const handleSignMessageSuccess = useCallback(
    async (
      data: PostOrderResponsePayload | undefined,
      variables: void,
      context: any
    ) => {
      signMessageDialog.setIsSuccess(true);
      signMessageDialog.setOpen(false);
      setShowOrderCreated(true);
      setOrderCreated(data);
    },
    [signMessageDialog]
  );

  const approveAsset = useApproveAssetMutation(
    nftSwapSdk,
    account,
    handleApproveAssetSuccess,
    {
      onMutate: handleApproveAssetMutate,
      onError: handleApproveAssetError,
    }
  );

  const handleOpenSignMessageListingDialog = useCallback(() => {
    signMessageDialog.setOpen(true);
    signMessageDialog.setMessage(
      formatMessage({
        id: 'creating.a.listing',
        defaultMessage: 'Creating a listing',
      })
    );
  }, [signMessageDialog]);

  const handleSignMessageError = useCallback(
    (err: any) => {
      signMessageDialog.setError(err);
    },
    [signMessageDialog]
  );

  const handleOpenSignMessageOfferDialog = useCallback(() => {
    signMessageDialog.setOpen(true);
    signMessageDialog.setMessage(
      formatMessage({
        id: 'creating.an.offer',
        defaultMessage: 'Creating an offer',
      })
    );
  }, [signMessageDialog]);

  const makeListing = useMakeListingMutation(
    nftSwapSdk,
    account,
    asset?.chainId,
    {
      onSuccess: handleSignMessageSuccess,
      onMutate: handleOpenSignMessageListingDialog,
      onError: handleSignMessageError,
    }
  );

  const makeOffer = useMakeOfferMutation(nftSwapSdk, account, asset?.chainId, {
    onSuccess: handleSignMessageSuccess,
    onMutate: handleOpenSignMessageOfferDialog,
    onError: handleSignMessageError,
  });

  const handleConfirmMakeListing = async (
    amount: ethers.BigNumber,
    tokenAddress: string,
    expiry: Date | null,
    takerAddress?: string
  ) => {
    if (account === undefined || asset === null) {
      return;
    }

    const status = await nftSwapSdk?.loadApprovalStatus(
      {
        tokenAddress: asset?.contractAddress as string,
        tokenId: asset.id as string,
        type: 'ERC721',
      },
      account
    );

    if (!status?.contractApproved) {
      await approveAsset.mutateAsync({
        asset: {
          tokenAddress: asset.contractAddress as string,
          tokenId: asset.id as string,
          type: 'ERC721',
        },
      });
    }

    await makeListing.mutateAsync({
      assetOffer: {
        tokenAddress: asset.contractAddress as string,
        tokenId: asset.id as string,
        type: 'ERC721',
      },
      another: {
        tokenAddress,
        amount: amount.toString(),
        type: 'ERC20',
      },
      expiry: expiry,
      taker: takerAddress,
    });
  };

  const handleConfirmMakeOffer = async (
    amount: ethers.BigNumber,
    tokenAddress: string,
    expiry: Date | null
  ) => {
    if (account === undefined) {
      return;
    }

    const status = await nftSwapSdk?.loadApprovalStatus(
      {
        tokenAddress,
        type: 'ERC20',
        amount: amount.toString(),
      },
      account
    );

    if (!status?.contractApproved) {
      await approveAsset.mutateAsync({
        asset: {
          tokenAddress,
          type: 'ERC20',
          amount: amount.toString(),
        },
      });
    }

    makeOffer.mutate({
      assetOffer: {
        tokenAddress: asset?.contractAddress as string,
        tokenId: asset?.id as string,
        type: 'ERC721',
      },
      another: {
        tokenAddress,
        amount: amount.toString(),
        type: 'ERC20',
      },
      expiry: expiry,
    });
  };

  const handleCloseCreatedOrderDialog = () => {
    setShowOrderCreated(false);
    setAsset(null);
    setOrderCreated(undefined);
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const hasChainDiff = useMemo(() => {
    return asset?.chainId !== undefined && asset?.chainId !== chainId;
  }, [asset]);

  return (
    <>
      <NextSeo
        title={formatMessage({
          id: 'create.order',
          defaultMessage: 'Create Order',
        })}
      />
      <ImportAssetDialog
        dialogProps={{
          open: showImportAsset,
          fullWidth: true,
          maxWidth: 'xs',
          onClose: handleToggleImportAsset,
        }}
      />
      <OrderCreatedDialog
        dialogProps={{
          open: showOrderCreated,
          fullWidth: true,
          maxWidth: 'xs',
          onClose: handleCloseCreatedOrderDialog,
        }}
        order={orderCreated}
      />
      <Container>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={12}>
            <PageHeader
              breadcrumbs={[
                {
                  caption: <FormattedMessage id="home" defaultMessage="Home" />,
                  uri: '/',
                },
                {
                  caption: (
                    <FormattedMessage
                      id="create.order"
                      defaultMessage="Create Order"
                    />
                  ),
                  uri: '/order/create',
                  active: true,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    alignContent: 'center',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  {isDesktop && (
                    <Typography>
                      <FormattedMessage
                        id="Create.Order"
                        defaultMessage="Create Order"
                      />
                    </Typography>
                  )}

                  <Button
                    startIcon={<ImportExportIcon />}
                    onClick={handleToggleImportAsset}
                    variant="outlined"
                    size="small"
                    fullWidth={!isDesktop}
                  >
                    <FormattedMessage id="import" defaultMessage="Import NFT" />
                  </Button>
                </Box>
              </CardContent>

              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      disablePortal
                      options={assets}
                      value={asset}
                      getOptionLabel={(option) =>
                        `${option.collectionName} #${option.id}`
                      }
                      groupBy={(option: Asset) => option.collectionName}
                      onChange={handleChangeOption}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={formatMessage({
                            id: 'nfts',
                            defaultMessage: 'NFTs',
                          })}
                        />
                      )}
                      renderOption={(props, option: Asset) => (
                        <ListItemButton component="li" {...props}>
                          <ListItemText
                            primary={`#${option.id}`}
                            secondary={option.collectionName}
                          />
                        </ListItemButton>
                      )}
                      fullWidth
                    />
                  </Grid>
                  {hasChainDiff && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        <FormattedMessage
                          id="switch.network.content.text"
                          defaultMessage="Please, switch to {chainName} network to create listings or offers for this asset"
                          description="Switch network dialog content text"
                          values={{
                            chainName: <b>{getChainName(asset?.chainId)}</b>,
                          }}
                        />
                      </Alert>
                    </Grid>
                  )}
                  {asset !== null ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 1 }}>
                        <Grid container spacing={1}>
                          <Grid item>
                            {asset?.metadata?.image === undefined ? (
                              <Skeleton
                                variant="rectangular"
                                sx={{ height: '100%', width: '100%' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: '100%',
                                  width: '100%',
                                }}
                              >
                                <Image
                                  alt={asset?.metadata?.name}
                                  src={ipfsUriToUrl(
                                    asset?.metadata?.image || ''
                                  )}
                                  height="100%"
                                  width="100%"
                                  objectFit="contain"
                                />
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body2" color="textSecondary">
                              {asset?.collectionName === undefined ? (
                                <Skeleton />
                              ) : (
                                asset?.collectionName
                              )}
                            </Typography>
                            <Typography
                              sx={{ fontWeight: 600 }}
                              variant="body1"
                            >
                              {asset?.metadata?.name === undefined ? (
                                <Skeleton />
                              ) : (
                                asset?.metadata?.name
                              )}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              <FormattedMessage
                                id="owned.by"
                                defaultMessage="Owned by"
                              />
                            </Typography>
                            <Link
                              href={`${getBlockExplorerUrl(
                                asset?.chainId
                              )}/address/${asset?.owner}`}
                              color="primary"
                              target="_blank"
                            >
                              <Stack
                                component="span"
                                direction="row"
                                alignItems="center"
                                alignContent="center"
                                spacing={0.5}
                              >
                                <div>
                                  {isAddressEqual(account, asset?.owner) ? (
                                    <FormattedMessage
                                      id="you"
                                      defaultMessage="you"
                                    />
                                  ) : (
                                    truncateAddress(asset?.owner)
                                  )}
                                </div>
                                <Launch fontSize="inherit" />
                              </Stack>
                            </Link>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <FormattedMessage
                          id="select.or.import.nft"
                          defaultMessage="Select or import a NFT to create an order"
                        />
                      </Alert>
                    </Grid>
                  )}
                  {asset !== null && (
                    <Grid item xs={12}>
                      {isAddressEqual(asset.owner, account) ? (
                        <MakeListingForm
                          disabled={hasChainDiff}
                          onConfirm={handleConfirmMakeListing}
                        />
                      ) : (
                        <MakeOfferForm
                          disabled={hasChainDiff}
                          onConfirm={handleConfirmMakeOffer}
                        />
                      )}
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

(OrdersIndex as any).getLayout = function getLayout(page: any) {
  return <MainLayout noSsr>{page}</MainLayout>;
};

export default OrdersIndex;
