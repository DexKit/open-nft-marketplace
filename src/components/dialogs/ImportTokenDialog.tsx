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
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormikHelpers, useFormik } from 'formik';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NETWORKS } from '../../constants/chain';
import { useTokenData } from '../../hooks/blockchain';
import { AppDialogTitle } from '../AppDialogTitle';

import * as Yup from 'yup';

import { useWeb3React } from '@web3-react/core';
import { AxiosError } from 'axios';
import { ethers } from 'ethers';
import { useSnackbar } from 'notistack';
import { useDebounce } from '../../hooks/misc';
import { tokensAtom } from '../../state/atoms';
import { Network } from '../../types/chains';
import { isAddressEqual } from '../../utils/blockchain';
import { ipfsUriToUrl } from '../../utils/ipfs';

interface Props {
  dialogProps: DialogProps;
}

interface Form {
  chainId: number;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}

const FormSchema: Yup.SchemaOf<Form> = Yup.object().shape({
  chainId: Yup.number().required(),
  contractAddress: Yup.string()
    .test('address', (value) => {
      return value !== undefined ? ethers.utils.isAddress(value) : true;
    })
    .required(),

  name: Yup.string().required(),
  symbol: Yup.string().required(),
  decimals: Yup.number().required(),
});

function ImportTokenDialog({ dialogProps }: Props) {
  const { onClose } = dialogProps;
  const { chainId } = useWeb3React();

  const [tokens, setTokens] = useAtom(tokensAtom);

  const { formatMessage } = useIntl();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = useCallback(
    (values: Form, formikHelpers: FormikHelpers<Form>) => {
      const token = tokens.find(
        (t) =>
          t.chainId === values.chainId &&
          isAddressEqual(values.contractAddress, t.address)
      );

      if (!token) {
        setTokens((value) => [
          ...value,
          {
            address: values.contractAddress.toLocaleLowerCase(),
            chainId: values.chainId,
            decimals: values.decimals || 0,
            logoURI: '',
            name: values.name || '',
            symbol: values.symbol || '',
          },
        ]);

        enqueueSnackbar(
          formatMessage({
            defaultMessage: 'Token added',
            id: 'token.added',
          }),
          {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
          }
        );
      }

      formikHelpers.resetForm();

      if (onClose) {
        onClose({}, 'escapeKeyDown');
      }
    },
    [tokens, enqueueSnackbar, onClose]
  );

  const formik = useFormik<Form>({
    initialValues: {
      chainId: 1,
      contractAddress: '',
      name: '',
      decimals: 0,
      symbol: '',
    },
    validationSchema: FormSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (chainId !== undefined) {
      formik.setFormikState((value) => ({
        ...value,
        values: { ...value.values, chainId },
      }));
    }
  }, [chainId]);

  const lazyAddress = useDebounce<string>(formik.values.contractAddress, 500);

  const tokenData = useTokenData({
    onSuccess: ({
      decimals,
      name,
      symbol,
    }: {
      decimals: number;
      name: string;
      symbol: string;
    }) => {
      formik.setValues(
        (value) => ({
          ...value,
          name: name || '',
          decimals: decimals || 0,
          symbol: symbol || '',
        }),
        true
      );
    },
    onError: (err: AxiosError) => {
      formik.resetForm({
        values: {
          contractAddress: '',
          name: '',
          decimals: 0,
          symbol: '',
          chainId: chainId || 1,
        },
      });
    },
  });

  const handleSubmitForm = () => {
    formik.submitForm();
  };

  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
    formik.resetForm();
  };

  const handleCloseError = () => tokenData.reset();

  useEffect(() => {
    if (lazyAddress !== '') {
      const token = tokens.find(
        (t) =>
          t.chainId === formik.values.chainId &&
          isAddressEqual(lazyAddress, t.address)
      );

      if (token) {
        formik.setFieldError(
          'contractAddress',
          formatMessage({
            id: 'token.already.imported',
            defaultMessage: 'Token already imported',
          })
        );
      } else {
        tokenData.mutate({
          chainId: formik.values.chainId,
          address: lazyAddress,
        });
      }
    }
  }, [lazyAddress, formik.values.chainId]);

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="import.token"
            defaultMessage="Import Token"
            description="Import token dialog title"
          />
        }
        onClose={handleClose}
      />
      <DialogContent dividers>
        <Stack spacing={2}>
          {tokenData.isError && (
            <Alert severity="error" onClose={handleCloseError}>
              {String(tokenData.error)}
            </Alert>
          )}
          <FormControl>
            <Select
              fullWidth
              value={formik.values.chainId}
              onChange={formik.handleChange}
              name="chainId"
              renderValue={(value) => {
                return (
                  <Stack
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                    spacing={1}
                  >
                    <Avatar
                      src={ipfsUriToUrl(
                        NETWORKS[formik.values.chainId].imageUrl || ''
                      )}
                      style={{ width: 'auto', height: '1rem' }}
                    />
                    <Typography variant="body1">
                      {NETWORKS[formik.values.chainId].name}
                    </Typography>
                  </Stack>
                );
              }}
            >
              {Object.keys(NETWORKS)
                .filter((key) => !NETWORKS[Number(key)].testnet)
                .map((key: any, index: number) => (
                  <MenuItem key={index} value={key}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: (theme) => theme.spacing(4),
                          display: 'flex',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Avatar
                          src={ipfsUriToUrl(
                            (NETWORKS[key] as Network)?.imageUrl || ''
                          )}
                          sx={{
                            width: 'auto',
                            height: '1rem',
                          }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={NETWORKS[key].name + index} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            value={formik.values.contractAddress}
            onChange={formik.handleChange}
            name="contractAddress"
            label={formatMessage({
              id: 'contract.address',
              defaultMessage: 'Contract address',
            })}
            error={Boolean(formik.errors.contractAddress)}
            helperText={
              Boolean(formik.errors.contractAddress)
                ? formik.errors.contractAddress
                : undefined
            }
          />
          <TextField
            fullWidth
            disabled={true}
            value={formik.values.name}
            onChange={formik.handleChange}
            name="name"
            label={formatMessage({
              id: 'name',
              defaultMessage: 'Name',
            })}
          />
          <TextField
            fullWidth
            disabled={true}
            value={formik.values.symbol}
            onChange={formik.handleChange}
            name="symbol"
            label={formatMessage({
              id: 'symbol',
              defaultMessage: 'Symbol',
            })}
          />
          <TextField
            disabled={true}
            type="number"
            fullWidth
            value={formik.values.decimals}
            onChange={formik.handleChange}
            name="decimals"
            label={formatMessage({
              id: 'decimals',
              defaultMessage: 'Decimals',
            })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!formik.isValid || tokenData.isLoading}
          onClick={handleSubmitForm}
          variant="contained"
          color="primary"
        >
          <FormattedMessage
            id="import"
            defaultMessage="Import"
            description="Import"
          />
        </Button>
        <Button onClick={handleClose}>
          <FormattedMessage
            id="cancel"
            defaultMessage="Cancel"
            description="Cancel"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportTokenDialog;
