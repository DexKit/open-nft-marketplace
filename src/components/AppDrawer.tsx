import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Stack,
  styled,
  Typography,
} from '@mui/material';

import { Language } from '@mui/icons-material';
import AttachMoney from '@mui/icons-material/AttachMoney';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useWeb3React } from '@web3-react/core';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { FormattedMessage } from 'react-intl';
import { useConnectWalletDialog } from '../hooks/app';
import { useIsBalanceVisible } from '../hooks/misc';
import {
  currencyAtom,
  localeAtom,
  showSelectCurrencyAtom,
  showSelectLocaleAtom,
} from '../state/atoms';
import {
  getChainLogoImage,
  getChainName,
  getWalletIcon,
  truncateAddress,
} from '../utils/blockchain';
import Wallet from './icons/Wallet';
import Link from './Link';
import { WalletButton } from './WalletButton';

const CustomListItemSecondaryAction = styled(ListItemSecondaryAction)({
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  height: '100%',
});

interface Props {
  open: boolean;
  onClose: () => void;
}

function AppDrawer({ open, onClose }: Props) {
  const { isActive, connector, account, chainId, ENSName } = useWeb3React();
  const isBalancesVisible = useIsBalanceVisible();

  const connectWalletDialog = useConnectWalletDialog();

  const handleConnectWallet = () => {
    onClose();
    connectWalletDialog.setOpen(true);
  };

  const locale = useAtomValue(localeAtom);
  const currency = useAtomValue(currencyAtom);

  const setShowShowSelectCurrency = useUpdateAtom(showSelectCurrencyAtom);

  const setShowShowSelectLocale = useUpdateAtom(showSelectLocaleAtom);

  const handleShowSelectCurrencyDialog = () => {
    setShowShowSelectCurrency(true);
  };

  const handleShowSelectLocaleDialog = () => {
    setShowShowSelectLocale(true);
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <Box
        sx={(theme) => ({ minWidth: `${theme.breakpoints.values.sm / 2}px` })}
      >
        <Box sx={{ p: 2 }}>
          {!isActive ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleConnectWallet}
              startIcon={<Wallet />}
              endIcon={<ChevronRightIcon />}
              fullWidth
            >
              <FormattedMessage
                id="connect.wallet"
                defaultMessage="Connect Wallet"
                description="Connect wallet button"
              />
            </Button>
          ) : (
            <Stack spacing={2}>
              <WalletButton align="left" />
              <Box
                sx={(theme) => ({
                  px: 2,
                  py: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.spacing(1),
                })}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={getChainLogoImage(chainId)}
                    sx={(theme) => ({
                      width: 'auto',
                      height: theme.spacing(2),
                    })}
                  />
                  <Typography variant="body1">
                    {getChainName(chainId)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
        <Divider />
        <List disablePadding>
          <ListItem divider onClick={onClose} component={Link} href="/" button>
            <ListItemIcon>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              sx={{ fontWeight: 600 }}
              primary={<FormattedMessage id="home" defaultMessage="Home" />}
            />
            <CustomListItemSecondaryAction>
              <ChevronRightIcon color="primary" />
            </CustomListItemSecondaryAction>
          </ListItem>
          <ListItem
            divider
            onClick={onClose}
            component={Link}
            href="/wallet"
            button
          >
            <ListItemIcon>
              <Wallet />
            </ListItemIcon>
            <ListItemText
              sx={{ fontWeight: 600 }}
              primary={<FormattedMessage id="wallet" defaultMessage="Wallet" />}
            />
            <CustomListItemSecondaryAction>
              <ChevronRightIcon color="primary" />
            </CustomListItemSecondaryAction>
          </ListItem>
        </List>
        <List
          disablePadding
          subheader={
            <>
              <ListSubheader disableSticky component="div">
                <FormattedMessage id="settings" defaultMessage="Settings" />
              </ListSubheader>
              <Divider />
            </>
          }
        >
          <ListItem divider onClick={handleShowSelectLocaleDialog}>
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="language" defaultMessage="Language" />
              }
              secondary={
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontWeight: 600 }}
                >
                  {locale}
                </Typography>
              }
            />
            <CustomListItemSecondaryAction>
              <ChevronRightIcon color="primary" />
            </CustomListItemSecondaryAction>
          </ListItem>
          <ListItem divider onClick={handleShowSelectCurrencyDialog}>
            <ListItemIcon>
              <AttachMoney />
            </ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="currency" defaultMessage="Currency" />
              }
              secondary={
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontWeight: 600 }}
                >
                  {currency.toUpperCase()}
                </Typography>
              }
            />
            <CustomListItemSecondaryAction>
              <ChevronRightIcon color="primary" />
            </CustomListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default AppDrawer;
