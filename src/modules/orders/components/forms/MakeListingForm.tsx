import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ethers } from 'ethers';

import moment from 'moment';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Token } from '../../../../types/blockchain';
import { ipfsUriToUrl } from '../../../../utils/ipfs';

import { FormikHelpers, useFormik } from 'formik';

import { ExpandMore } from '@mui/icons-material';
import { useWeb3React } from '@web3-react/core';
import * as Yup from 'yup';
import AppFeePercentageSpan from '../../../../components/AppFeePercentageSpan';
import { MIN_ORDER_DATE_TIME } from '../../../../constants';
import { useTokenList } from '../../../../hooks/blockchain';
import { isAddressEqual } from '../../../../utils/blockchain';
import { isValidDecimal } from '../../../../utils/numbers';
import DurationSelect from '../../../nft/components/DurationSelect';

interface Form {
  price: string;
  tokenAddress: string;
  expiry: Date;
  taker?: string;
}

const FormSchema: Yup.SchemaOf<Form> = Yup.object().shape({
  price: Yup.string().required(),
  tokenAddress: Yup.string().required(),
  expiry: Yup.date().required(),
  taker: Yup.string()
    .test('address', (value) => {
      return value !== undefined ? ethers.utils.isAddress(value) : true;
    })
    .notRequired(),
});

interface Props {
  disabled?: boolean;
  onConfirm: (
    price: ethers.BigNumber,
    tokenAddress: string,
    expiry: Date | null,
    takerAddress?: string
  ) => void;
}

export default function MakeListingForm({ onConfirm, disabled }: Props) {
  const { chainId } = useWeb3React();

  const { formatMessage } = useIntl();

  const tokenList = useTokenList({ chainId, includeNative: true });

  const handleConfirm = (values: Form, formikHelpers: FormikHelpers<Form>) => {
    if (form.isValid) {
      const decimals = tokenList.find(
        (t) => t.address === values.tokenAddress
      )?.decimals;

      if (!isValidDecimal(values.price, decimals || 0)) {
        formikHelpers.setFieldError(
          'price',
          formatMessage({
            id: 'invalid.price',
            defaultMessage: 'Invalid price',
          })
        );

        return;
      }

      onConfirm(
        ethers.utils.parseUnits(values.price, decimals),
        values.tokenAddress,
        values.expiry || null,
        values.taker
      );

      formikHelpers.resetForm();
    }
  };

  const form = useFormik<Form>({
    initialValues: {
      price: '0',
      expiry: moment().add(MIN_ORDER_DATE_TIME).toDate(),
      tokenAddress: tokenList.length > 0 ? tokenList[0].address : '',
    },
    validationSchema: FormSchema,
    isInitialValid: false,
    onSubmit: handleConfirm,
  });

  const tokenSelected = useMemo(() => {
    const tokenIndex = tokenList.findIndex((t) =>
      isAddressEqual(t.address, form.values.tokenAddress)
    );

    if (tokenIndex > -1) {
      return tokenList[tokenIndex];
    }
  }, [tokenList, form.values.tokenAddress]);

  const handleChangeExpiryDuration = (newValue: moment.Duration | null) => {
    form.setFieldValue('expiry', moment().add(newValue).toDate());
  };

  const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue('price', e.target.value);
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
                        spacing={1}
                      >
                        <img
                          alt={tokenSelected?.name}
                          src={ipfsUriToUrl(tokenSelected?.logoURI || '')}
                          style={{ width: 'auto', height: '1rem' }}
                        />
                        <Box>
                          <Typography variant="body1">
                            {tokenSelected?.symbol}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  }}
                >
                  {tokenList.map((token: Token, index: number) => (
                    <MenuItem value={token.address} key={index}>
                      <ListItemIcon>
                        <img
                          alt={token.name}
                          src={ipfsUriToUrl(token.logoURI || '')}
                          style={{ width: 'auto', height: '1rem' }}
                        />
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
                disabled={tokenSelected === undefined}
                value={form.values.price}
                onChange={handleChangePrice}
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
        <Grid item xs={12}>
          <DurationSelect
            label={<FormattedMessage id="expiry" defaultMessage="Expiry" />}
            onChange={handleChangeExpiryDuration}
          />
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="inherit" sx={{ fontWeight: 600 }}>
                <FormattedMessage
                  id="advanced"
                  defaultMessage="Advanced"
                  description="Make listing advanced accordion"
                />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Alert severity="info">
                  <FormattedMessage
                    id="advanced.info"
                    defaultMessage="Only the address entered below can buy this listing. If empty, any account can buy this listing."
                  />
                </Alert>
                <TextField
                  label={
                    <FormattedMessage
                      id="buyer.address"
                      defaultMessage="Buyer address"
                      description="Buyer address input label"
                    />
                  }
                  fullWidth
                  name="taker"
                  value={form.values.taker}
                  onChange={form.handleChange}
                  error={Boolean(form.errors.taker)}
                  helperText={
                    Boolean(form.errors.taker)
                      ? String(form.errors.taker)
                      : undefined
                  }
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>
        {tokenSelected && (
          <Grid item xs={12}>
            <Alert severity="info">
              <FormattedMessage
                id="the.buyer.will.pay.percentage.in.fees"
                defaultMessage="The buyer will pay {price} {symbol} +{percentage} in fees"
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
            <FormattedMessage
              id="create.listing"
              defaultMessage="Create Listing"
            />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
