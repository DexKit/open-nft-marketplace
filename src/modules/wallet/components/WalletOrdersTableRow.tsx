import {
  Avatar,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { utils } from 'ethers';
import moment from 'moment';
import { useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Link from '../../../components/Link';
import MomentFromNow from '../../../components/MomentFromNow';
import { useTokenList } from '../../../hooks/blockchain';
import { useCoinPricesQuery, useCurrency } from '../../../hooks/currency';
import { OrderBookItem } from '../../../types/nft';
import { OrderDirection } from '../../../types/orderbook';
import {
  getNetworkSlugFromChainId,
  isAddressEqual,
} from '../../../utils/blockchain';

interface Props {
  order: OrderBookItem;
}

export function WalletOrdersTableRow({ order }: Props) {
  const currency = useCurrency();

  const tokens = useTokenList({
    chainId: parseInt(order.chainId),
    includeNative: true,
  });

  const token = tokens.find((t) => isAddressEqual(t.address, order.erc20Token));

  const amountRow = useMemo(() => {
    if (token) {
      return (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          alignContent="center"
        >
          <Avatar src={token.logoURI} sx={{ width: 'auto', height: '1rem' }} />

          <Typography variant="inherit">
            {
              <FormattedNumber
                currency={currency}
                value={parseFloat(
                  utils.formatUnits(
                    order.order.erc20TokenAmount,
                    token.decimals
                  )
                )}
              />
            }{' '}
            {token.symbol.toUpperCase()}
          </Typography>
        </Stack>
      );
    } else {
      return (
        <FormattedMessage id="unknown.token" defaultMessage={'Unknown token'} />
      );
    }
  }, [order, token]);

  const coinPricesQuery = useCoinPricesQuery({ includeNative: true });

  const totalInCurrency = useMemo(() => {
    if (token && currency && order) {
      if (coinPricesQuery?.data) {
        const ratio =
          coinPricesQuery.data[token.address.toLowerCase()][currency];

        if (ratio) {
          return (
            ratio *
            parseFloat(
              utils.formatUnits(order?.erc20TokenAmount, token.decimals)
            )
          );
        } else {
          return 0;
        }
      }
    }
  }, [token, coinPricesQuery, currency, order]);

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/order/${getNetworkSlugFromChainId(order.asset?.chainId)}/${
            order?.order.nonce
          }`}
        >
          {order?.order?.nonce.substring(order?.order?.nonce.length - 8)}
        </Link>
      </TableCell>
      <TableCell>
        <Link
          href={`/asset/${getNetworkSlugFromChainId(order.asset?.chainId)}/${
            order.asset?.contractAddress
          }/${order.asset?.id}`}
        >
          {order.asset?.metadata?.name || (
            <FormattedMessage id="unknown.name" defaultMessage="Unknown name" />
          )}
        </Link>
      </TableCell>
      <TableCell>
        {order.asset?.collectionName || (
          <FormattedMessage
            id="unknown.collection"
            defaultMessage="Unknown collection"
          />
        )}
      </TableCell>

      <TableCell>
        {order.order.direction === OrderDirection.Buy ? (
          <FormattedMessage id="offer" defaultMessage="Offer" />
        ) : (
          <FormattedMessage id="Listing" defaultMessage="Listing" />
        )}
      </TableCell>
      <TableCell>
        {totalInCurrency} {currency.toUpperCase()}
      </TableCell>
      <TableCell>{amountRow}</TableCell>
      <TableCell>
        <MomentFromNow
          from={moment.unix(parseInt(order?.order.expiry || '0'))}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          color={
            moment.unix(parseInt(order?.order.expiry || '0')).isBefore(moment())
              ? 'error'
              : 'default'
          }
          label={
            moment
              .unix(parseInt(order?.order.expiry || '0'))
              .isBefore(moment()) ? (
              <FormattedMessage id="expired" defaultMessage="Expired" />
            ) : (
              <FormattedMessage id="open" defaultMessage="Open" />
            )
          }
        />
      </TableCell>
    </TableRow>
  );
}

export default WalletOrdersTableRow;
