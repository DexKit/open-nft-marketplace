import { NavigateNext, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  NoSsr,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { NextPage } from 'next';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../src/components/layouts/main';

import transakSDK from '@transak/transak-sdk';

import WalletBalances from '../../src/modules/wallet/components/WalletBalancesTable';

import { FormattedMessage, useIntl } from 'react-intl';
import {
  TransactionsTable,
  TransactionsTableFilter,
} from '../../src/modules/wallet/components/TransactionsTable';
import { isBalancesVisibleAtom } from '../../src/state/atoms';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useWeb3React } from '@web3-react/core';
import { useAtom } from 'jotai';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Link from '../../src/components/Link';
import { PageHeader } from '../../src/components/PageHeader';
import { useFavoriteAssets } from '../../src/hooks/nft';
import ReceiveDialog from '../../src/modules/wallet/components/dialogs/ReceiveDialog';
import WalletActionButton from '../../src/modules/wallet/components/WalletActionButton';
import { WalletTotalBalanceCointainer } from '../../src/modules/wallet/components/WalletTotalBalanceContainer';
import { getAppConfig } from '../../src/services/app';
import { truncateAddress } from '../../src/utils/blockchain';

import ImportExportIcon from '@mui/icons-material/ImportExport';
import ImportTokenDialog from '../../src/components/dialogs/ImportTokenDialog';
import { useCurrency } from '../../src/hooks/currency';

enum WalletTabs {
  Transactions,
  Trades,
}

const appConfig = getAppConfig();

const Wallet: NextPage = () => {
  const { account, ENSName } = useWeb3React();

  const { formatMessage } = useIntl();

  const favorites = useFavoriteAssets();

  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState(WalletTabs.Transactions);
  const [isTableOpen, setIsTableOpen] = useState(isDesktop);

  const [isBalancesVisible, setIsBalancesVisible] = useAtom(
    isBalancesVisibleAtom
  );

  const handleChangeTab = (
    event: React.SyntheticEvent<Element, Event>,
    value: WalletTabs
  ) => {
    setSelectedTab(value);
  };

  const handleToggleBalances = () => {
    setIsTableOpen((value) => !value);
  };

  const handleToggleVisibility = () => {
    setIsBalancesVisible((value) => !value);
  };

  const handleOpenReceive = () => {
    setIsReceiveOpen(true);
  };

  const handleCloseReceive = () => {
    setIsReceiveOpen(false);
  };

  const currency = useCurrency();

  const transak = useRef<any>();

  useEffect(() => {
    if (appConfig.transak?.enabled) {
      if (account !== undefined) {
        transak.current = new transakSDK({
          apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY, // Your API Key
          environment:
            process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING', // STAGING/PRODUCTION
          hostURL: window.location.origin,
          widgetHeight: '625px',
          widgetWidth: '500px',
          walletAddress: account, // Your customer's wallet address
          fiatCurrency: currency.toUpperCase(), // If you want to limit fiat selection eg 'USD'
        });
      }
    }
  }, [account, currency]);

  const handleBuy = () => {
    transak.current?.init();
  };

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleCloseImportTokenDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleOpenImportTokenDialog = () => {
    setIsImportDialogOpen(true);
  };

  return (
    <>
      <NextSeo
        title={formatMessage({
          id: 'my.wallet',
          defaultMessage: 'My Wallet',
        })}
      />
      <ReceiveDialog
        dialogProps={{
          open: isReceiveOpen,
          onClose: handleCloseReceive,
          maxWidth: 'xs',
          fullWidth: true,
        }}
        account={account}
      />
      <ImportTokenDialog
        dialogProps={{
          open: isImportDialogOpen,
          onClose: handleCloseImportTokenDialog,
          maxWidth: 'xs',
          fullWidth: true,
        }}
      />
      <Box>
        <Container>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12}>
              <PageHeader
                breadcrumbs={[
                  {
                    caption: (
                      <FormattedMessage id="home" defaultMessage="Home" />
                    ),
                    uri: '/',
                  },
                  {
                    caption: (
                      <FormattedMessage id="wallet" defaultMessage="Wallet" />
                    ),
                    uri: '/wallet',
                    active: true,
                  },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    alignContent="center"
                    spacing={2}
                  >
                    <Grid item>
                      <Typography variant="caption" color="textSecondary">
                        {isBalancesVisible
                          ? ENSName
                            ? ENSName
                            : truncateAddress(account)
                          : '*****'}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        alignContent="center"
                        spacing={1}
                      >
                        <Typography variant="h5">
                          <NoSsr>
                            <WalletTotalBalanceCointainer />
                          </NoSsr>
                        </Typography>
                        <IconButton onClick={handleToggleVisibility}>
                          {isBalancesVisible ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
                          )}
                        </IconButton>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        {appConfig.transak?.enabled && (
                          <Grid item>
                            <Button
                              onClick={handleBuy}
                              variant="contained"
                              color="primary"
                            >
                              <FormattedMessage id="buy" defaultMessage="Buy" />
                            </Button>
                          </Grid>
                        )}

                        <Grid item>
                          <Button
                            onClick={handleOpenReceive}
                            variant="outlined"
                            color="primary"
                          >
                            <FormattedMessage
                              id="receive"
                              defaultMessage="Receive"
                            />
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid
                      item
                      xs={isDesktop ? undefined : 12}
                      sm={isDesktop ? true : undefined}
                    >
                      <TextField
                        size="small"
                        type="search"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Search color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={isDesktop ? undefined : 12}>
                      <Button
                        onClick={handleOpenImportTokenDialog}
                        variant="outlined"
                        startIcon={<ImportExportIcon />}
                        fullWidth
                      >
                        <FormattedMessage
                          id="import.token"
                          defaultMessage="Import token"
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <NoSsr>
                    <Collapse in={isTableOpen}>
                      <WalletBalances />
                    </Collapse>
                  </NoSsr>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    onClick={handleToggleBalances}
                    fullWidth
                    sx={(theme) => ({
                      backgroundColor: theme.palette.background.paper,
                      py: 2,
                    })}
                    startIcon={
                      isTableOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                  >
                    {isTableOpen ? (
                      <FormattedMessage id="close" defaultMessage="Close" />
                    ) : (
                      <FormattedMessage id="open" defaultMessage="Open" />
                    )}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <WalletActionButton
                        LinkComponent={Link}
                        href="/wallet/nfts"
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          alignContent="center"
                        >
                          <Typography variant="h5">
                            <FormattedMessage id="nfts" defaultMessage="NFTs" />
                          </Typography>
                          {Object.keys(favorites.assets).length > 0 && (
                            <Chip
                              label={Object.keys(favorites.assets).length}
                              color="secondary"
                            />
                          )}
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          alignContent="center"
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                            color="primary"
                            variant="body1"
                          >
                            <FormattedMessage id="open" defaultMessage="Open" />
                          </Typography>
                          <NavigateNext color="primary" />
                        </Stack>
                      </WalletActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <WalletActionButton
                        LinkComponent={Link}
                        href="/wallet/orders"
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          alignContent="center"
                        >
                          <Typography variant="h5">
                            <FormattedMessage
                              id="orders"
                              defaultMessage="Orders"
                            />
                          </Typography>
                          {/* <Chip label="302" color="secondary" /> */}
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          alignContent="center"
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                            color="primary"
                            variant="body1"
                          >
                            <FormattedMessage id="open" defaultMessage="Open" />
                          </Typography>
                          <NavigateNext color="primary" />
                        </Stack>
                      </WalletActionButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Tabs value={selectedTab} onChange={handleChangeTab}>
                    <Tab
                      value={WalletTabs.Transactions}
                      label={
                        <FormattedMessage
                          id="transactions"
                          defaultMessage="Transactions"
                        />
                      }
                    />
                    <Tab
                      value={WalletTabs.Trades}
                      label={
                        <FormattedMessage id="trades" defaultMessage="Trades" />
                      }
                    />
                  </Tabs>
                </Grid>
                <Grid item xs={12}>
                  <NoSsr>
                    <TransactionsTable
                      filter={
                        selectedTab === WalletTabs.Transactions
                          ? TransactionsTableFilter.Transactions
                          : TransactionsTableFilter.Trades
                      }
                    />
                  </NoSsr>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

(Wallet as any).getLayout = function getLayout(page: any) {
  return <MainLayout noSsr>{page}</MainLayout>;
};

export default Wallet;
