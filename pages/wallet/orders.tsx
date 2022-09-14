import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { NextPage } from 'next';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { QueryErrorResetBoundary } from 'react-query';
import Funnel from '../../src/components/icons/Filter';
import MainLayout from '../../src/components/layouts/main';
import { PageHeader } from '../../src/components/PageHeader';
import SidebarFilters from '../../src/components/SidebarFilters';
import SidebarFiltersContent from '../../src/components/SidebarFiltersContent';
import { SellOrBuy, TraderOrderStatus } from '../../src/constants/enum';
import TableSkeleton from '../../src/modules/nft/components/tables/TableSkeleton';
import WalletOrders from '../../src/modules/wallet/components/WalletOrders';

const WalletOrder: NextPage = () => {
  const [sellOrBuy, setSellOrBuy] = useState<SellOrBuy>(SellOrBuy.All);
  const [orderStatus, setOrderStatus] = useState<TraderOrderStatus>(
    TraderOrderStatus.All
  );

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleCloseDrawer = () => setIsFiltersOpen(false);
  const handleOpenDrawer = () => setIsFiltersOpen(true);

  const handleChangeSellOrBuy = (e: SelectChangeEvent<SellOrBuy>) => {
    setSellOrBuy(e.target.value as SellOrBuy);
  };

  const handleChangeOrderStatus = (e: SelectChangeEvent<TraderOrderStatus>) => {
    setOrderStatus(e.target.value as TraderOrderStatus);
  };

  const renderSidebar = (onClose?: () => void) => {
    return (
      <SidebarFilters
        title={<FormattedMessage id="filters" defaultMessage="Filters" />}
        onClose={onClose}
      >
        <SidebarFiltersContent>
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <FormattedMessage id="order.type" defaultMessage="Order type" />
            </Typography>
            <Select
              size="small"
              value={sellOrBuy}
              onChange={handleChangeSellOrBuy}
            >
              <MenuItem value={SellOrBuy.All}>
                <FormattedMessage id="select.type" defaultMessage="All" />
              </MenuItem>
              <MenuItem value={SellOrBuy.Sell}>
                <FormattedMessage id="listings" defaultMessage="Listings" />
              </MenuItem>
              <MenuItem value={SellOrBuy.Buy}>
                <FormattedMessage id="offers" defaultMessage="Offers" />
              </MenuItem>
            </Select>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <FormattedMessage id="status" defaultMessage="Status" />
            </Typography>
            <Select
              size="small"
              value={orderStatus}
              onChange={handleChangeOrderStatus}
            >
              <MenuItem value={TraderOrderStatus.All}>
                <FormattedMessage id="all" defaultMessage="All" />
              </MenuItem>
              <MenuItem value={TraderOrderStatus.Expired}>
                <FormattedMessage id="expired" defaultMessage="Expired" />
              </MenuItem>
              <MenuItem value={TraderOrderStatus.Open}>
                <FormattedMessage id="open" defaultMessage="Open" />
              </MenuItem>
              <MenuItem value={TraderOrderStatus.Filled}>
                <FormattedMessage id="filled" defaultMessage="Filled" />
              </MenuItem>
            </Select>
          </Stack>
        </SidebarFiltersContent>
      </SidebarFilters>
    );
  };

  const renderDrawer = () => {
    return (
      <Drawer open={isFiltersOpen} onClose={handleCloseDrawer}>
        <Box
          sx={(theme) => ({ minWidth: `${theme.breakpoints.values.sm / 2}px` })}
        >
          {renderSidebar(handleCloseDrawer)}
        </Box>
      </Drawer>
    );
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {renderDrawer()}
      <Grid container>
        {!isMobile && (
          <Grid item xs={12} sm={2}>
            {renderSidebar()}
          </Grid>
        )}

        <Grid item xs={12} sm={10}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
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
                    },
                    {
                      caption: (
                        <FormattedMessage id="orders" defaultMessage="Orders" />
                      ),
                      uri: '/wallet/orders',
                      active: true,
                    },
                  ]}
                />
              </Grid>

              {isMobile && (
                <Grid item xs={12}>
                  <Stack
                    justifyContent="space-between"
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <FormattedMessage
                        id="orders"
                        defaultMessage="Orders"
                        description="Orders"
                      />
                    </Typography>
                    <Box>
                      {isMobile && (
                        <IconButton onClick={handleOpenDrawer}>
                          <Funnel />
                        </IconButton>
                      )}
                    </Box>
                  </Stack>
                </Grid>
              )}
              <Grid item xs={12}>
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
                            <Button
                              color="primary"
                              onClick={resetErrorBoundary}
                            >
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
                      <Suspense fallback={<TableSkeleton rows={4} />}>
                        <WalletOrders filter={{ sellOrBuy, orderStatus }} />
                      </Suspense>
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

(WalletOrder as any).getLayout = function getLayout(page: any) {
  return (
    <MainLayout noSsr disablePadding>
      {page}
    </MainLayout>
  );
};

export default WalletOrder;
