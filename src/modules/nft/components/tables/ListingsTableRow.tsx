import LaunchIcon from '@mui/icons-material/Launch';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { utils } from 'ethers';
import moment from 'moment';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import {
  getBlockExplorerUrl,
  isAddressEqual,
  truncateAddress,
} from '../../../../utils/blockchain';
import { ipfsUriToUrl } from '../../../../utils/ipfs';

import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { memo, useMemo, useRef } from 'react';
import Link from '../../../../components/Link';
import MomentFromNow from '../../../../components/MomentFromNow';
import { useTokenList } from '../../../../hooks/blockchain';
import { useCoinPricesQuery, useCurrency } from '../../../../hooks/currency';
import { Asset, SwapApiOrder } from '../../../../types/nft';

interface Props {
  chainId: string;
  order: any;
  asset?: Asset;
  account?: string;
  onCancel?: (order: SwapApiOrder) => void;
  onBuy?: (order: SwapApiOrder) => void;
  onMenu?: (el: HTMLElement | null, order?: SwapApiOrder) => void;
}

export function ListingsTableRow({
  chainId,
  order,
  asset,
  account,
  onBuy,
  onCancel,
  onMenu,
}: Props) {
  const tokens = useTokenList({
    chainId: parseInt(chainId || '0'),
    includeNative: true,
  });

  const token = tokens.find((t) =>
    isAddressEqual(t.address, order?.erc20Token)
  );

  const elRef = useRef<HTMLElement | null>(null);

  const currency = useCurrency();

  const coinPricesQuery = useCoinPricesQuery({ includeNative: true });

  const totalInCurrency = useMemo(() => {
    if (token && currency && order) {
      if (coinPricesQuery?.data) {
        let ratio = 0;

        const tokenData = coinPricesQuery.data[token.address.toLowerCase()];

        if (tokenData && currency in tokenData) {
          ratio = tokenData[currency];
        }

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
        <Stack
          direction="row"
          alignItems="center"
          alignContent="center"
          spacing={0.5}
        >
          <Tooltip title={token?.symbol || ''}>
            <Avatar
              sx={{ width: 'auto', height: '1rem' }}
              src={ipfsUriToUrl(token?.logoURI || '')}
            />
          </Tooltip>
          <Typography variant="body1">
            {utils.formatUnits(order.erc20TokenAmount, token?.decimals || 18)}{' '}
            {token?.symbol.toUpperCase()}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        {totalInCurrency ? (
          <>
            <FormattedNumber value={totalInCurrency} currency={currency} />{' '}
            {currency.toUpperCase()}
          </>
        ) : (
          <Skeleton />
        )}
      </TableCell>
      <TableCell>
        <MomentFromNow from={moment.unix(parseInt(order.expiry))} />
      </TableCell>
      <TableCell>
        <Link
          color="primary"
          href={
            chainId !== undefined
              ? `${getBlockExplorerUrl(parseInt(chainId))}/address/${
                  order.maker
                }`
              : '/'
          }
          target="_blank"
        >
          <Stack
            direction="row"
            alignItems="center"
            alignContent="center"
            spacing={0.5}
          >
            <Box>
              {isAddressEqual(account, order?.maker) ? (
                <FormattedMessage
                  defaultMessage="you"
                  id="you"
                  description="You"
                />
              ) : (
                truncateAddress(order.maker)
              )}
            </Box>
            <LaunchIcon fontSize="inherit" />
          </Stack>
        </Link>
      </TableCell>
      <TableCell>
        {asset?.owner === account && isAddressEqual(account, order.maker) ? (
          <Button
            startIcon={<CancelIcon />}
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onCancel!(order)}
          >
            <FormattedMessage
              id="cancel"
              defaultMessage="Cancel"
              description="Cancel"
            />
          </Button>
        ) : (
          <Button
            startIcon={<CancelIcon />}
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onBuy!(order)}
          >
            <FormattedMessage
              id="buy"
              defaultMessage="Buy"
              description="Buy asset button text"
            />
          </Button>
        )}
      </TableCell>
      <TableCell>
        <IconButton
          ref={(ref) => {
            elRef.current = ref;
          }}
          onClick={() => onMenu!(elRef.current, order)}
        >
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default memo(ListingsTableRow);
