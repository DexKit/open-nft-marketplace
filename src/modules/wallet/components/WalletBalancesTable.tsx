import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { QueryErrorResetBoundary } from 'react-query';
import { useERC20BalancesQuery } from '../../../hooks/balances';
import { useCoinPricesQuery, useCurrency } from '../../../hooks/currency';
import { useIsBalanceVisible } from '../../../hooks/misc';
import WalletTableRow from './WalletTableRow';

interface Props {
  isBalancesVisible: boolean;
}

function WalletBalancesTable({ isBalancesVisible }: Props) {
  const tokenBalancesQuery = useERC20BalancesQuery();
  const coinPricesQuery = useCoinPricesQuery({ includeNative: true });
  const prices = coinPricesQuery.data;
  const currency = useCurrency();

  const tokenBalancesWithPrices = useMemo(() => {
    return tokenBalancesQuery?.data?.map((tb) => {
      return {
        ...tb,
        price:
          prices && prices[tb.token.address.toLowerCase()]
            ? prices[tb.token.address.toLowerCase()][currency]
            : undefined,
      };
    });
  }, [prices, tokenBalancesQuery.data, currency]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage id="token" defaultMessage="Token" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="total" defaultMessage="Total" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="balance" defaultMessage="Balance" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokenBalancesWithPrices?.map((token, index: number) => (
            <WalletTableRow
              key={index}
              tokenBalance={token}
              price={token.price}
              isBalancesVisible={isBalancesVisible}
              currency={currency}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function WalletTableSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <Table>
      <TableBody>
        {new Array(rows).fill(null).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton />
            </TableCell>
            <TableCell>
              <Skeleton />
            </TableCell>
            <TableCell>
              <Skeleton />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WalletBalances() {
  const isBalancesVisible = useIsBalanceVisible();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <Paper sx={{ p: 1 }}>
              <Stack justifyContent="center" alignItems="center">
                <Typography variant="h6">
                  <FormattedMessage
                    id="something.went.wrong"
                    defaultMessage="Oops, something went wrong"
                    description="Something went wrong error message"
                  />
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {String(error)}
                </Typography>
                <Button color="primary" onClick={resetErrorBoundary}>
                  <FormattedMessage
                    id="try.again"
                    defaultMessage="Try again"
                    description="Try again"
                  />
                </Button>
              </Stack>
            </Paper>
          )}
        >
          <Suspense fallback={<WalletTableSkeleton rows={4} />}>
            <WalletBalancesTable isBalancesVisible={isBalancesVisible} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default WalletBalances;
