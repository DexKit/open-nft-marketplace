import {
  Avatar,
  Box,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { FormattedNumber } from 'react-intl';

import { TokenBalance } from '../../../types/blockchain';
import { ipfsUriToUrl } from '../../../utils/ipfs';
import { TOKEN_ICON_URL } from '../../../utils/token';

interface Props {
  isBalancesVisible: boolean;
  tokenBalance: TokenBalance;
  currency: string;
  price?: number;
}

function WalletTableRow({
  tokenBalance,
  isBalancesVisible,
  price,
  currency,
}: Props) {
  const { chainId } = useWeb3React();
  const { token, balance } = tokenBalance;

  const balanceUnits = ethers.utils.formatUnits(balance || '0', token.decimals);

  const totalInCurrency = (
    <FormattedNumber
      value={(price || 0) * Number(balanceUnits)}
      style={'currency'}
      currency={currency}
    />
  );
  return (
    <TableRow>
      <TableCell>
        <Stack
          direction="row"
          alignItems="center"
          alignContent="center"
          spacing={2}
        >
          <Avatar
            sx={{ width: 'auto', height: '2rem' }}
            src={
              token.logoURI
                ? ipfsUriToUrl(token.logoURI || '')
                : TOKEN_ICON_URL(token.address, chainId)
            }
          />

          <Box>
            <Typography variant="body1">{token.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {token.symbol}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>{isBalancesVisible ? totalInCurrency : '*****'}</TableCell>
      <TableCell>
        {isBalancesVisible ? (
          <>
            {<FormattedNumber value={Number(balanceUnits)} />} {token.symbol}
          </>
        ) : (
          '*****'
        )}
      </TableCell>
    </TableRow>
  );
}

export default WalletTableRow;
