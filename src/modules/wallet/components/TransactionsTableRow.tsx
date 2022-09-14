import { Done, Error } from '@mui/icons-material';
import { CircularProgress, TableCell, TableRow } from '@mui/material';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Link from '../../../components/Link';
import MomentFromNow from '../../../components/MomentFromNow';
import TransactionTitle from '../../../components/TransactionTitle';
import { Transaction, TransactionStatus } from '../../../types/blockchain';
import { getBlockExplorerUrl } from '../../../utils/blockchain';

interface Props {
  transaction: Transaction;
  hash: string;
  icon: React.ReactNode | React.ReactNode[];
}

export function TransactionsTableRow({ transaction, hash, icon }: Props) {
  const { metadata, type } = transaction;

  return (
    <TableRow>
      <TableCell>{icon}</TableCell>
      <TableCell>
        <TransactionTitle metadata={metadata} type={type} />
      </TableCell>
      <TableCell>
        <MomentFromNow from={moment(new Date(transaction.created))} />
      </TableCell>
      <TableCell>
        {transaction.status === TransactionStatus.Pending ? (
          <CircularProgress size="1.5rem" />
        ) : transaction.status === TransactionStatus.Confirmed ? (
          <Done fontSize="small" />
        ) : transaction.status === TransactionStatus.Failed ? (
          <Error fontSize="small" />
        ) : null}
      </TableCell>
      <TableCell>
        <Link
          sx={{ textTransform: 'uppercase', textDecoration: 'none' }}
          href={`${getBlockExplorerUrl(transaction.chainId)}/tx/${hash}`}
          target="_blank"
        >
          <FormattedMessage id="view" defaultMessage="view" />
        </Link>
      </TableCell>
    </TableRow>
  );
}
