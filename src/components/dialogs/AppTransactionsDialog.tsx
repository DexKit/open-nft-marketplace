import React, { useCallback, useMemo } from 'react';

import { Error } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Divider,
  lighten,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { transactionsAtom, uncheckedTransactionsAtom } from '../../state/atoms';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../types/blockchain';
import { getBlockExplorerUrl } from '../../utils/blockchain';
import { AppDialogTitle } from '../AppDialogTitle';
import ArrowSwap from '../icons/ArrowSwap';
import CardTick from '../icons/CardTick';
import CloseCircle from '../icons/CloseCircle';
import MoneyReceive from '../icons/MoneyReceive';
import MoneySend from '../icons/MoneySend';
import Link from '../Link';
import MomentFromNow from '../MomentFromNow';
import TransactionTitle from '../TransactionTitle';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface Props {
  dialogProps: DialogProps;
}

export function AppTransactionsDialog({ dialogProps }: Props) {
  const { onClose } = dialogProps;
  const { chainId } = useWeb3React();
  const [transactions, updateTransactions] = useAtom(transactionsAtom);

  const uncheckedTransactions = useAtomValue(uncheckedTransactionsAtom);

  const filteredUncheckedTransactions = useMemo(() => {
    return uncheckedTransactions.filter((tx) => tx.chainId === chainId);
  }, [chainId, uncheckedTransactions]);

  const notificationsKeys = useMemo(() => {
    return Object.keys(transactions);
  }, [transactions]);

  const handleClearTransactions = () => updateTransactions({});

  const theme = useTheme();

  const renderIcon = useCallback(
    (hash: string) => {
      let icon: React.ReactNode;
      let bgcolor: string = theme.palette.action.hover;

      if (transactions[hash].type === TransactionType.CANCEL) {
        icon = <CloseCircle />;
        bgcolor = lighten(theme.palette.error.light, 0.8);
      } else if (transactions[hash].type === TransactionType.BUY) {
        icon = <MoneySend />;
        bgcolor = lighten(theme.palette.success.light, 0.8);
      } else if (transactions[hash].type === TransactionType.ACCEPT) {
        icon = <MoneyReceive />;
        bgcolor = lighten(theme.palette.success.light, 0.8);
      } else if (transactions[hash].type === TransactionType.SWAP) {
        icon = <ArrowSwap />;
        bgcolor = lighten(theme.palette.success.light, 0.8);
      } else if (
        transactions[hash].type === TransactionType.APPROVAL_FOR_ALL ||
        transactions[hash].type === TransactionType.APPROVE
      ) {
        icon = <CardTick />;
        bgcolor = lighten(theme.palette.info.light, 0.8);
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignitems: 'center',
            p: 1,
            bgcolor,
            borderRadius: (theme) => theme.shape.borderRadius,
          }}
        >
          {icon}
        </Box>
      );
    },
    [transactions, theme]
  );

  const renderTransactionsList = () => {
    if (notificationsKeys.length === 0) {
      return (
        <Stack sx={{ py: 2 }} alignItems="center" justifyContent="center">
          <Typography variant="body1">
            <FormattedMessage
              id="nothing.to.see.here"
              defaultMessage="Nothing to see here"
            />
          </Typography>
        </Stack>
      );
    }

    return (
      <List disablePadding>
        {notificationsKeys
          .filter((hash) => transactions[hash].chainId === chainId)
          .reverse()
          .map((hash, index: number) => (
            <ListItem
              divider
              button
              key={index}
              component={Link}
              target="_blank"
              href={`${getBlockExplorerUrl(
                transactions[hash].chainId
              )}/tx/${hash}`}
            >
              <ListItemIcon>{renderIcon(hash)}</ListItemIcon>
              <ListItemText
                primary={
                  <TransactionTitle
                    metadata={transactions[hash]?.metadata}
                    type={transactions[hash]?.type}
                  />
                }
                secondary={
                  <Stack spacing={0.5} direction="row" alignItems="center">
                    {!transactions[hash].checked && (
                      <FiberManualRecordIcon fontSize="small" color="primary" />
                    )}
                    <MomentFromNow
                      from={moment(new Date(transactions[hash].created))}
                    />
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                {transactions[hash].status === TransactionStatus.Pending ? (
                  <CircularProgress size="1.5rem" />
                ) : transactions[hash].status ===
                  TransactionStatus.Confirmed ? (
                  <CheckCircleIcon />
                ) : transactions[hash].status === TransactionStatus.Failed ? (
                  <Error />
                ) : null}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
    );
  };

  const handleClose = () => {
    if (filteredUncheckedTransactions.length > 0) {
      updateTransactions((txs: { [key: string]: Transaction }) => {
        let newTxs: { [key: string]: Transaction } = { ...txs };

        for (let key of Object.keys(txs)) {
          if (!newTxs[key].checked) {
            newTxs[key].checked = true;
          }
        }

        return newTxs;
      });
    }

    onClose!({}, 'backdropClick');
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="transactions"
            defaultMessage="Transactions"
            description="Transactions dialog title"
          />
        }
        onClose={handleClose}
      />
      <Divider />
      <DialogContent sx={{ p: 0 }}>{renderTransactionsList()}</DialogContent>
      <DialogActions>
        {notificationsKeys.length > 0 && (
          <Button onClick={handleClearTransactions}>
            <FormattedMessage
              id="clear.transactions"
              defaultMessage="Clear Transactions"
              description="Clear transactions button label"
            />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AppTransactionsDialog;
