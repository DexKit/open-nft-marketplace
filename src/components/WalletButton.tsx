import { Logout } from '@mui/icons-material';
import {
  Avatar,
  ButtonBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { isBalancesVisibleAtom } from '../state/atoms';
import { getWalletIcon, truncateAddress } from '../utils/blockchain';
import { FormattedMessage } from 'react-intl';

interface Props {
  align?: 'center' | 'left';
}

export function WalletButton(props: Props) {
  const { align } = props;
  const { connector, account, ENSName } = useWeb3React();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isBalancesVisible = useAtomValue(isBalancesVisibleAtom);

  const justifyContent = align === 'left' ? 'flex-start' : 'center';

  const handleLogoutWallet = useCallback(() => {
    if (connector?.deactivate) {
      connector.deactivate();
    }
  }, [connector]);

  return (
    <>
      <ButtonBase
        id="wallet-button"
        sx={(theme) => ({
          px: 2,
          py: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(1),
          justifyContent,
        })}
        onClick={handleClick}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={getWalletIcon(connector)}
            sx={(theme) => ({
              width: theme.spacing(2),
              height: theme.spacing(2),
            })}
          />
          <Typography variant="body1">
            {isBalancesVisible
              ? ENSName
                ? ENSName
                : truncateAddress(account)
              : '**********'}
          </Typography>
        </Stack>
      </ButtonBase>
      <Menu
        id="wallet-menuu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'wallet-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogoutWallet}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="logout.wallet" defaultMessage="Logout wallet" />
        </MenuItem>
      </Menu>
    </>
  );
}
