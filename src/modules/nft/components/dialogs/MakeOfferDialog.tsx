import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  FormControl,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { AppDialogTitle } from '../../../../components/AppDialogTitle';

import { BigNumber, ethers } from 'ethers';

import { useWeb3React } from '@web3-react/core';
import moment from 'moment';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAssetMetadata, useErc20Balance } from '../../../../hooks/nft';
import { Token } from '../../../../types/blockchain';
import { ipfsUriToUrl } from '../../../../utils/ipfs';

import { FormikErrors, FormikHelpers, useFormik } from 'formik';

import { useTheme } from '@mui/material';
import Image from 'next/image';
import * as Yup from 'yup';
import AppFeePercentageSpan from '../../../../components/AppFeePercentageSpan';
import { MIN_ORDER_DATE_TIME } from '../../../../constants';
import { useTokenList } from '../../../../hooks/blockchain';
import { getAppConfig } from '../../../../services/app';
import { Asset } from '../../../../types/nft';
import { isAddressEqual } from '../../../../utils/blockchain';
import { isValidDecimal } from '../../../../utils/numbers';
import { TOKEN_ICON_URL } from '../../../../utils/token';
import DurationSelect from '../DurationSelect';

const appConfig = getAppConfig();

interface Form {
  price: string;
  tokenAddress: string;
  expiry: Date;
}

const FormSchema: Yup.SchemaOf<Form> = Yup.object().shape({
  price: Yup.string().required(),
  tokenAddress: Yup.string().required(),
  expiry: Yup.date().required(),
});

interface Props {
  dialogProps: DialogProps;
  account?: string;
  asset?: Asset;
  onConfirm: (
    price: ethers.BigNumber,
    tokenAddress: string,
    expiry: Date | null
  ) => void;
}

export function MakeOfferDialog({ dialogProps, onConfirm, asset }: Props) {
  const { provider, account, chainId } = useWeb3React();

  const tokenList = useTokenList({ chainId, includeNative: false });

  const { onClose } = dialogProps;

  const { data: metadata } = useAssetMetadata(asset);

  const { formatMessage } = useIntl();

  const handleConfirm = (values: Form, formikHelpers: FormikHelpers<Form>) => {
    const decimals = tokenList.find(
      (t) => t.address === values.tokenAddress
    )?.decimals;

    if (!isValidDecimal(values.price, decimals || 1)) {
      formikHelpers.setFieldError(
        'price',
        formatMessage({
          id: 'invalid.price',
          defaultMessage: 'Invalid price',
        })
      );
    }

    onConfirm(
      ethers.utils.parseUnits(values.price, decimals),
      values.tokenAddress,
      values.expiry || null
    );

    formikHelpers.resetForm();
  };

  const form = useFormik<Form>({
    initialValues: {
      price: '0',
      expiry: moment().add(MIN_ORDER_DATE_TIME).toDate(),
      tokenAddress: tokenList.length > 0 ? tokenList[0].address : '',
    },
    validate: async (values) => {
      const decimals = tokenList.find(
        (t) => t.address === values.tokenAddress
      )?.decimals;

      if (values.price !== '' && isValidDecimal(values.price, decimals || 1)) {
        const priceValue = ethers.utils.parseUnits(values.price, decimals);

        const errors: FormikErrors<Form> = {};

        if (priceValue.gt(erc20Balance.data || BigNumber.from(0))) {
          errors.price = formatMessage({
            id: 'insufficient.funds',
            defaultMessage: 'insufficient funds',
          });
        }

        return errors;
      }
    },
    validationSchema: FormSchema,
    isInitialValid: false,
    onSubmit: handleConfirm,
  });

  const erc20Balance = useErc20Balance(
    provider,
    form.values.tokenAddress,
    account
  );

  const handleChangeExpiryDuration = (newValue: moment.Duration | null) => {
    form.setFieldValue('expiry', moment().add(newValue).toDate());
  };

  const handleChangeExpiry = (newValue: moment.Moment | null) => {
    form.setFieldValue('expiry', newValue?.toDate());
  };

  const handleClose = () => {
    form.resetForm();

    onClose!({}, 'backdropClick');
  };

  const tokenSelected = useMemo(() => {
    const tokenIndex = tokenList.findIndex((t) =>
      isAddressEqual(t.address, form.values.tokenAddress)
    );

    if (tokenIndex > -1) {
      return tokenList[tokenIndex];
    }
  }, [tokenList, form.values.tokenAddress]);

  const theme = useTheme();

  const renderImageUrl = (token?: Token) => {
    if (!token) {
      return (
        <Avatar sx={{ width: 'auto', height: (theme) => theme.spacing(2) }} />
      );
    }

    if (token.logoURI) {
      return (
        <img
          alt={token.name}
          src={ipfsUriToUrl(token.logoURI || '')}
          width="auto"
          height={theme.spacing(2)}
        />
      );
    } else {
      const imageUrl = TOKEN_ICON_URL(
        token.address.toLowerCase(),
        token.chainId
      );

      if (imageUrl) {
        return (
          <img
            alt={token.name}
            src={imageUrl}
            width="auto"
            height={theme.spacing(2)}
          />
        );
      } else {
        return (
          <Avatar sx={{ width: 'auto', height: (theme) => theme.spacing(2) }} />
        );
      }
    }
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="make.offer"
            defaultMessage="Make Offer"
            description="Make Offer"
          />
        }
        onClose={handleClose}
      />
      <form onSubmit={form.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item>
                  {metadata?.image === undefined ? (
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
                        alt={metadata?.name}
                        src={ipfsUriToUrl(metadata?.image || '')}
                        height="100%"
                        width="100%"
                        objectFit="contain"
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs>
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
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      fullWidth
                      variant="outlined"
                      value={form.values.tokenAddress}
                      onChange={form.handleChange}
                      name="tokenAddress"
                      renderValue={(value) => {
                        return (
                          <Stack
                            direction="row"
                            alignItems="center"
                            alignContent="center"
                            spacing={0.5}
                          >
                            {renderImageUrl(tokenSelected)}
                            <Typography variant="body1">
                              {tokenSelected?.symbol}
                            </Typography>
                          </Stack>
                        );
                      }}
                    >
                      {tokenList?.map((token: Token, index: number) => (
                        <MenuItem value={token.address} key={index}>
                          <ListItemIcon
                            sx={{
                              display: 'flex',
                              alignItems: 'ceter',
                              alignContent: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {renderImageUrl(token)}
                          </ListItemIcon>
                          <ListItemText
                            primary={token.symbol}
                            secondary={token.name}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={
                      form.values.tokenAddress === undefined ||
                      form.values.tokenAddress === ''
                    }
                    value={form.values.price}
                    onChange={form.handleChange}
                    name="price"
                    label={
                      <FormattedMessage
                        id="price"
                        defaultMessage="Price"
                        description="Price label"
                      />
                    }
                    fullWidth
                    error={Boolean(form.errors.price)}
                    helperText={
                      Boolean(form.errors.price) ? form.errors.price : undefined
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
            {tokenSelected && (
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  alignContent="center"
                  justifyContent="right"
                  spacing={1}
                >
                  <Typography variant="body1" align="right">
                    <FormattedMessage
                      id="available.balance"
                      defaultMessage="Available Balance"
                    />
                    :
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                    justifyContent="right"
                    spacing={0.5}
                  >
                    {renderImageUrl(tokenSelected)}
                    <Typography
                      sx={{ fontWeight: 600 }}
                      variant="body1"
                      align="right"
                    >
                      {erc20Balance.isLoading ? (
                        <Skeleton />
                      ) : (
                        ethers.utils.formatUnits(
                          erc20Balance.data || ethers.BigNumber.from(0),
                          tokenSelected.decimals
                        )
                      )}{' '}
                      {tokenSelected.symbol.toUpperCase()}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <DurationSelect
                label={<FormattedMessage id="expiry" defaultMessage="Expiry" />}
                onChange={handleChangeExpiryDuration}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <DateTimePicker
                ampm={false}
                label={<FormattedMessage id="expiry" defaultMessage="Expiry" />}
                onChange={handleChangeExpiry}
                value={form.values.expiry}
                minDateTime={moment().add(MIN_ORDER_DATE_TIME)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(form.errors.expiry)}
                    helperText={
                      Boolean(form.errors.expiry)
                        ? String(form.errors.expiry)
                        : undefined
                    }
                  />
                )}
                InputProps={{
                  name: 'expiry',
                }}
              />
            </Grid> */}

            {tokenSelected && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <FormattedMessage
                    id="you.are.paying.percentage.in.fees"
                    defaultMessage="You are paying {price} {symbol} + {percentage} in fees"
                    values={{
                      price: form.values.price,
                      symbol: tokenSelected?.symbol,
                      percentage: (
                        <b>
                          <AppFeePercentageSpan />
                        </b>
                      ),
                    }}
                  />
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack>
                <Typography variant="body1"></Typography>
                <Typography variant="body1"></Typography>
              </Stack>
              <Stack>
                <Typography variant="body1"></Typography>
                <Typography variant="body1"></Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!form.isValid}
            type="submit"
            variant="contained"
            color="primary"
          >
            <FormattedMessage
              defaultMessage="Confirm"
              description="Confirm"
              id="confirm"
            />
          </Button>
          <Button onClick={handleClose}>
            <FormattedMessage
              defaultMessage="Cancel"
              id="cancel"
              description="Cancel"
            />
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
