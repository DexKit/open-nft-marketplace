import {
  Alert,
  Avatar,
  Button,
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

import { BigNumber, utils } from 'ethers';

import { useWeb3React } from '@web3-react/core';
import moment from 'moment';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useErc20Balance } from '../../../../hooks/nft';
import { Token } from '../../../../types/blockchain';
import { ipfsUriToUrl } from '../../../../utils/ipfs';

import { FormikErrors, FormikHelpers, useFormik } from 'formik';

import { useTheme } from '@mui/material';
import * as Yup from 'yup';
import AppFeePercentageSpan from '../../../../components/AppFeePercentageSpan';
import { MIN_ORDER_DATE_TIME } from '../../../../constants';
import { useTokenList } from '../../../../hooks/blockchain';
import { getAppConfig } from '../../../../services/app';
import { Asset } from '../../../../types/nft';
import { isAddressEqual } from '../../../../utils/blockchain';
import { isValidDecimal } from '../../../../utils/numbers';
import { TOKEN_ICON_URL } from '../../../../utils/token';
import DurationSelect from '../../../nft/components/DurationSelect';

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
  account?: string;
  asset?: Asset;
  disabled?: boolean;
  onConfirm: (
    price: BigNumber,
    tokenAddress: string,
    expiry: Date | null
  ) => void;
}

export default function MakeOfferForm({ onConfirm, asset, disabled }: Props) {
  const { provider, account, chainId } = useWeb3React();

  const tokenList = useTokenList({ chainId, includeNative: false });

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
      utils.parseUnits(values.price, decimals),
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
        const priceValue = utils.parseUnits(values.price);

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

  const handleFormSubmit = () => {
    form.submitForm();
  };

  return (
    <form onSubmit={form.handleSubmit}>
      <Grid container spacing={2}>
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
                    utils.formatUnits(
                      erc20Balance.data || BigNumber.from(0),
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
          <Button
            onClick={handleFormSubmit}
            disabled={!form.isValid || disabled}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            <FormattedMessage id="create.offer" defaultMessage="Create Offer" />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
