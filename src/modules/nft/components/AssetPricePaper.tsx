import { Button, Grid, Paper, Stack } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../../../components/Icon';
import DollarSquare from '../../../components/icons/DollarSquare';

import { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { useQueryClient } from 'react-query';
import {
  useConnectWalletDialog,
  useSignMessageDialog,
  useTransactions,
} from '../../../hooks/app';
import { useSwitchNetwork } from '../../../hooks/blockchain';
import {
  GET_NFT_ORDERS,
  useApproveAssetMutation,
  useAsset,
  useAssetMetadata,
  useMakeListingMutation,
  useMakeOfferMutation,
  useSwapSdkV4,
} from '../../../hooks/nft';
import {
  getERC20Decimals,
  getERC20Name,
  getERC20Symbol,
} from '../../../services/balances';
import {
  ApproveTransactionMetadata,
  TransactionType,
} from '../../../types/blockchain';
import { isAddressEqual } from '../../../utils/blockchain';
import { MakeListingDialog } from './dialogs/MakeListingDialog';
import { MakeOfferDialog } from './dialogs/MakeOfferDialog';

interface Props {
  address: string;
  id: string;
}

export function AssetPricePaper({ address, id }: Props) {
  const { account, chainId, provider, isActive } = useWeb3React();

  const { formatMessage } = useIntl();

  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  const queryClient = useQueryClient();

  const [openMakeOffer, setOpenMakeOffer] = useState(false);
  const [openMakeListing, setOpenMakeListing] = useState(false);

  const nftSwapSdk = useSwapSdkV4(provider, chainId);

  const { openDialog: switchNetwork } = useSwitchNetwork();
  const transactions = useTransactions();

  const handleApproveAssetSuccess = useCallback(
    async (hash: string, swapAsset: SwappableAssetV4) => {
      if (asset !== undefined) {
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

          transactions.showDialog(
            true,
            { amount, decimals, symbol } as ApproveTransactionMetadata,
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

  const approveAsset = useApproveAssetMutation(
    nftSwapSdk,
    account,
    handleApproveAssetSuccess,
    {
      onMutate: handleApproveAssetMutate,
      onError: handleApproveAssetError,
    }
  );

  const signMessageDialog = useSignMessageDialog();

  const handleOpenSignMessageListingDialog = useCallback(() => {
    signMessageDialog.setOpen(true);
    signMessageDialog.setMessage(
      formatMessage({
        id: 'creating.a.listing',
        defaultMessage: 'Creating a listing',
      })
    );
  }, [signMessageDialog]);

  const handleOpenSignMessageOfferDialog = useCallback(() => {
    signMessageDialog.setOpen(true);
    signMessageDialog.setMessage(
      formatMessage({
        id: 'creating.an.offer',
        defaultMessage: 'Creating an offer',
      })
    );
  }, [signMessageDialog]);

  const handleInvalidateCache = useCallback(() => {
    queryClient.invalidateQueries(GET_NFT_ORDERS);
  }, [signMessageDialog]);

  const handleSignMessageError = useCallback(
    (err: any) => {
      signMessageDialog.setError(err);
    },
    [signMessageDialog]
  );

  const handleSignMessageSuccess = useCallback(() => {
    handleInvalidateCache();
    signMessageDialog.setIsSuccess(true);
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

  const handleOpenMakeListingDialog = () => {
    if (chainId === undefined && asset?.chainId === undefined) {
      return;
    }

    if (chainId !== asset?.chainId) {
      if (asset?.chainId) {
        switchNetwork(asset?.chainId);
      }
    } else {
      setOpenMakeListing(true);
    }
  };

  const connectWalletDialog = useConnectWalletDialog();

  const handleOpenMakeOfferDialog = () => {
    if (!isActive || chainId === undefined) {
      connectWalletDialog.setOpen(true);
    } else if (chainId !== asset?.chainId) {
      if (asset?.chainId) {
        switchNetwork(asset?.chainId);
      }
    } else {
      setOpenMakeOffer(true);
    }
  };

  const handleCloseMakeListingDialog = () => setOpenMakeListing(false);

  const handleCloseMakeOfferDialog = () => setOpenMakeOffer(false);

  const handleConfirmMakeListing = async (
    amount: ethers.BigNumber,
    tokenAddress: string,
    expiry: Date | null,
    takerAddress?: string
  ) => {
    setOpenMakeListing(false);

    if (account === undefined) {
      return;
    }

    const status = await nftSwapSdk?.loadApprovalStatus(
      {
        tokenAddress: address as string,
        tokenId: id as string,
        type: 'ERC721',
      },
      account
    );

    if (!status?.contractApproved) {
      await approveAsset.mutateAsync({
        asset: {
          tokenAddress: address as string,
          tokenId: id as string,
          type: 'ERC721',
        },
      });
    }

    await makeListing.mutateAsync({
      assetOffer: {
        tokenAddress: address as string,
        tokenId: id as string,
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
    setOpenMakeOffer(false);

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
        tokenAddress: address as string,
        tokenId: id as string,
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

  return (
    <>
      <MakeListingDialog
        dialogProps={{
          open: openMakeListing,
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleCloseMakeListingDialog,
        }}
        onConfirm={handleConfirmMakeListing}
        asset={asset}
        metadata={metadata}
      />
      <MakeOfferDialog
        dialogProps={{
          open: openMakeOffer,
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleCloseMakeOfferDialog,
        }}
        onConfirm={handleConfirmMakeOffer}
        account={account}
        asset={asset}
      />
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* <Box>
              <Typography variant="caption" color="textSecondary">
                <FormattedMessage
                  id="highest.offer"
                  defaultMessage="Highest Offer"
                  description="Highest Offer"
                />
              </Typography>
              <Typography variant="h6">0.0004</Typography>
            </Box> */}
            {isAddressEqual(account, asset?.owner) ? (
              <Button
                size="large"
                onClick={handleOpenMakeListingDialog}
                startIcon={<DollarSquare color="primary" />}
                variant="outlined"
              >
                <FormattedMessage
                  defaultMessage="Sell"
                  description="Sell button"
                  id="sell"
                />
              </Button>
            ) : (
              <Button
                size="large"
                onClick={handleOpenMakeOfferDialog}
                startIcon={<Icon icon="tag" size="medium" color="primary" />}
                variant="outlined"
              >
                <FormattedMessage
                  defaultMessage="Make Offer"
                  description="Make offer button"
                  id="make.offer"
                />
              </Button>
            )}
          </Stack>
        </Paper>
      </Grid>
    </>
  );
}
