import {
  Box,
  lighten,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import CardTick from '../../../components/icons/CardTick';
import CloseCircle from '../../../components/icons/CloseCircle';
import MoneyReceive from '../../../components/icons/MoneyReceive';
import MoneySend from '../../../components/icons/MoneySend';
import { transactionsAtom } from '../../../state/atoms';
import { TransactionType } from '../../../types/blockchain';
import { TransactionsTableRow } from './TransactionsTableRow';

export enum TransactionsTableFilter {
  Transactions,
  Trades,
}

export function TransactionsTable({
  filter,
}: {
  filter: TransactionsTableFilter;
}) {
  const { chainId } = useWeb3React();
  const transactions = useAtomValue(transactionsAtom);

  const notificationsKeys = useMemo(() => {
    return Object.keys(transactions);
  }, [transactions]);

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
    const filteredNotificationsKeys = notificationsKeys
      .filter((hash) => {
        if (transactions[hash].chainId !== chainId) {
          return false;
        }
        return true;
      })
      .reverse()
      .map((hash, index: number) => (
        <TransactionsTableRow
          key={index}
          icon={renderIcon(hash)}
          transaction={transactions[hash]}
          hash={hash}
        />
      ));

    if (filteredNotificationsKeys.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Stack sx={{ py: 2 }} alignItems="center" justifyContent="center">
              <Typography variant="body1" color="textSecondary">
                <FormattedMessage
                  id="nothing.to.see.here"
                  defaultMessage="Nothing to see here"
                />
              </Typography>
            </Stack>
          </TableCell>
        </TableRow>
      );
    }

    return filteredNotificationsKeys;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <FormattedMessage id="transaction" defaultMessage="Transaction" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="date" defaultMessage="Date" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="status" defaultMessage="Status" />
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTransactionsList()}</TableBody>
      </Table>
    </TableContainer>
  );
}
