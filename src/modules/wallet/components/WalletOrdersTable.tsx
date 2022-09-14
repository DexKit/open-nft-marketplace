import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import CloseCircle from '../../../components/icons/CloseCircle';
import Wallet from '../../../components/icons/Wallet';
import { useConnectWalletDialog } from '../../../hooks/app';
import { useCurrency } from '../../../hooks/currency';
import { OrderBookItem } from '../../../types/nft';
import WalletOrdersTableRow from './WalletOrdersTableRow';

interface Props {
  orders: OrderBookItem[];
}

export function WalletOrdersTable({ orders }: Props) {
  const currency = useCurrency();
  const { isActive } = useWeb3React();

  const connectWalletDialog = useConnectWalletDialog();

  const handleConnectWallet = () => {
    connectWalletDialog.setOpen(true);
  };

  const renderRows = useCallback(() => {
    if (!isActive) {
      return (
        <TableRow>
          <TableCell colSpan={7}>
            <Box sx={{ py: 4 }}>
              <Stack
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                spacing={2}
              >
                <CloseCircle color="error" />
                <Box>
                  <Typography
                    align="center"
                    variant="subtitle1"
                    sx={{ fontWeight: 600 }}
                  >
                    <FormattedMessage
                      id="wallet.is.not.connected"
                      defaultMessage="Wallet is not connected"
                    />
                  </Typography>
                  <Typography
                    align="center"
                    variant="body2"
                    color="textSecondary"
                  >
                    <FormattedMessage
                      id="please.connect.your.wallet"
                      defaultMessage="Please, connect your wallet to see orders"
                    />
                  </Typography>
                </Box>
                <Button
                  onClick={handleConnectWallet}
                  variant="contained"
                  startIcon={<Wallet />}
                >
                  <FormattedMessage
                    id="connect.wallet"
                    defaultMessage="Connect Wallet"
                  />
                </Button>
              </Stack>
            </Box>
          </TableCell>
        </TableRow>
      );
    } else if (orders.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7}>
            <Box sx={{ py: 4 }}>
              <Stack
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                spacing={2}
              >
                <CloseCircle color="error" />
                <Typography variant="body1" color="textSecondary">
                  <FormattedMessage
                    id="no.orders.found"
                    defaultMessage="No Orders Found"
                  />
                </Typography>
              </Stack>
            </Box>
          </TableCell>
        </TableRow>
      );
    }

    return orders.map((order, index) => (
      <WalletOrdersTableRow key={index} order={order} />
    ));
  }, [orders, isActive]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage id="ID" defaultMessage="ID" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="name" defaultMessage="Name" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="collection" defaultMessage="Collection" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="type" defaultMessage="Type" />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="price.fiat"
                defaultMessage="Price {currency}"
                values={{ currency: currency.toUpperCase() }}
              />
            </TableCell>
            <TableCell>
              <FormattedMessage id="price" defaultMessage="Price" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="expiry" defaultMessage="Expiry" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="status" defaultMessage="Status" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default WalletOrdersTable;
