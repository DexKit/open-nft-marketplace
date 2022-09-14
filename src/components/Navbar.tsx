import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useMemo, useRef, useState } from 'react';

import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  NoSsr,
  Popover,
  Stack,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';

import SettingsIcon from '@mui/icons-material/Settings';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  getChainLogoImage,
  getChainName,
  getWalletIcon,
  truncateAddress,
} from '../utils/blockchain';
import Link from './Link';

import { Language } from '@mui/icons-material';
import AttachMoney from '@mui/icons-material/AttachMoney';
import { useAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { FormattedMessage } from 'react-intl';
import { useConnectWalletDialog } from '../hooks/app';
import { useSelectNetworkDialog } from '../hooks/misc';
import { getAppConfig } from '../services/app';
import {
  currencyAtom,
  drawerIsOpenAtom,
  hasPendingTransactionsAtom,
  isBalancesVisibleAtom,
  localeAtom,
  showSelectCurrencyAtom,
  showSelectLocaleAtom,
  uncheckedTransactionsAtom,
} from '../state/atoms';
import { AppTransactionsDialog } from './dialogs/AppTransactionsDialog';
import SelectNetworkDialog from './dialogs/SelectNetworkDialog';
import Notification from './icons/Notification';
import Wallet from './icons/Wallet';
import { WalletButton } from './WalletButton';

const appConfig = getAppConfig();

const LogoImage = styled('img')({});

function Navbar() {
  const { isActive, connector, account, chainId, ENSName } = useWeb3React();

  const buttonRef = useRef<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const isBalancesVisible = useAtomValue(isBalancesVisibleAtom);

  const connectWalletDialog = useConnectWalletDialog();

  const selectNetworkDialog = useSelectNetworkDialog();

  const handleCloseSelectNetworkDialog = () => {
    selectNetworkDialog.setIsOpen(false);
  };

  const handleOpenSelectNetworkDialog = () => {
    selectNetworkDialog.setIsOpen(true);
  };

  const handleOpenConnectWalletDialog = () => {
    connectWalletDialog.setOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const hasPendingTransactions = useAtomValue(hasPendingTransactionsAtom);

  const uncheckedTransactions = useAtomValue(uncheckedTransactionsAtom);

  const [showSelectCurrency, setShowShowSelectCurrency] = useAtom(
    showSelectCurrencyAtom
  );

  const [showSelectLocale, setShowShowSelectLocale] =
    useAtom(showSelectLocaleAtom);

  const filteredUncheckedTransactions = useMemo(() => {
    return uncheckedTransactions.filter((tx) => tx.chainId === chainId);
  }, [chainId, uncheckedTransactions]);

  const [showTransactions, setShowTransactions] = useState(false);

  const handleOpenTransactions = () => setShowTransactions(true);
  const handleCloseNotifications = () => setShowTransactions(false);

  const setIsDrawerOpen = useUpdateAtom(drawerIsOpenAtom);

  const handleToggleDrawer = () => setIsDrawerOpen((value) => !value);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorMenuEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const openMenu = Boolean(anchorMenuEl);

  const handleSettingsMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleShowSelectCurrencyDialog = () => {
    setShowShowSelectCurrency(true);
    handleSettingsMenuClose();
  };

  const handleShowSelectLocaleDialog = () => {
    setShowShowSelectLocale(true);
    handleSettingsMenuClose();
  };

  const currency = useAtomValue(currencyAtom);
  const locale = useAtomValue(localeAtom);

  return (
    <>
      <Menu
        id="settings-menu"
        anchorEl={anchorMenuEl}
        open={openMenu}
        onClose={handleSettingsMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleShowSelectLocaleDialog}>
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
        </MenuItem>
        <MenuItem onClick={handleShowSelectCurrencyDialog}>
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
        </MenuItem>
      </Menu>
      <AppTransactionsDialog
        dialogProps={{
          maxWidth: 'sm',
          open: showTransactions,
          fullWidth: true,
          onClose: handleCloseNotifications,
        }}
      />
      <SelectNetworkDialog
        dialogProps={{
          maxWidth: 'sm',
          open: selectNetworkDialog.isOpen,
          fullWidth: true,
          onClose: handleCloseSelectNetworkDialog,
        }}
      />
      <Popover
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorEl={buttonRef.current}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Divider />
        <List disablePadding>
          <ListItem button component={Link} href="/wallet">
            <ListItemIcon>
              <Wallet />
            </ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="wallet" defaultMessage="Wallet" />}
            />
          </ListItem>
          {/* <ListItem button onClick={handleDisconnect}>
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="Disconnect" />
          </ListItem> */}
        </List>
      </Popover>
      <AppBar variant="elevation" color="default" position="sticky">
        <Toolbar variant="dense" sx={{ py: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleToggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}
          {appConfig?.logo ? (
            <Link href="/">
              <LogoImage
                src={appConfig?.logo.url}
                alt={appConfig.name}
                title={appConfig.name}
                sx={
                  appConfig.logo.width && appConfig.logo.height
                    ? {
                        width: appConfig.logo.width,
                        height: appConfig.logo.height,
                      }
                    : {
                        height: theme.spacing(6),
                      }
                }
              />
            </Link>
          ) : (
            <Link
              sx={{ textDecoration: 'none' }}
              variant="h6"
              color="primary"
              href="/"
            >
              {appConfig.name}
            </Link>
          )}

          <Stack
            direction="row"
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              center: 'right',
              justifyContent: 'flex-end',
              px: 2,
            }}
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              sx={{
                center: 'right',
                justifyContent: 'flex-end',
              }}
              alignItems="center"
              spacing={2}
            >
              <Link
                color="inherit"
                href="/"
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                <FormattedMessage id="home" defaultMessage="Home" />
              </Link>
              {isActive && (
                <Link
                  color="inherit"
                  href="/wallet"
                  sx={{ fontWeight: 600, textDecoration: 'none' }}
                >
                  <FormattedMessage id="wallet" defaultMessage="Wallet" />
                </Link>
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              alignContent="center"
            >
              {/* <Button variant="outlined" color="primary">
                Buy ETH
              </Button> */}

              {isActive && (
                <ButtonBase
                  onClick={handleOpenSelectNetworkDialog}
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
                      alt={getChainName(chainId) || ''}
                    />
                    <Typography variant="body1">
                      {getChainName(chainId)}
                    </Typography>
                    <KeyboardArrowDownIcon />
                  </Stack>
                </ButtonBase>
              )}

              {!isActive ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleOpenConnectWalletDialog}
                  startIcon={<Wallet />}
                  endIcon={<ChevronRightIcon />}
                >
                  <FormattedMessage
                    id="connect.wallet"
                    defaultMessage="Connect Wallet"
                    description="Connect wallet button"
                  />
                </Button>
              ) : (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <WalletButton />
                  <NoSsr>
                    <IconButton onClick={handleOpenTransactions}>
                      <Badge
                        variant={
                          hasPendingTransactions &&
                          filteredUncheckedTransactions.length === 0
                            ? 'dot'
                            : 'standard'
                        }
                        color="primary"
                        badgeContent={
                          filteredUncheckedTransactions.length > 0
                            ? filteredUncheckedTransactions.length
                            : undefined
                        }
                        invisible={
                          !hasPendingTransactions &&
                          filteredUncheckedTransactions.length === 0
                        }
                      >
                        <Notification />
                      </Badge>
                    </IconButton>
                    <IconButton onClick={handleSettingsMenuClick}>
                      <SettingsIcon />
                    </IconButton>
                  </NoSsr>
                </Stack>
              )}
            </Stack>
          </Stack>
          <Box
            sx={{
              display: {
                sm: 'none',
                xs: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
              },
            }}
          >
            <NoSsr>
              <IconButton onClick={handleOpenTransactions}>
                <Badge
                  variant={
                    hasPendingTransactions &&
                    filteredUncheckedTransactions.length === 0
                      ? 'dot'
                      : 'standard'
                  }
                  color="primary"
                  badgeContent={
                    filteredUncheckedTransactions.length > 0
                      ? filteredUncheckedTransactions.length
                      : undefined
                  }
                  invisible={
                    !hasPendingTransactions &&
                    filteredUncheckedTransactions.length === 0
                  }
                >
                  <Notification />
                </Badge>
              </IconButton>
            </NoSsr>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Navbar;
