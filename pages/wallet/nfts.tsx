import {
  Box,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NextPage } from 'next';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MainLayout from '../../src/components/layouts/main';
import { PageHeader } from '../../src/components/PageHeader';
import SidebarFilters from '../../src/components/SidebarFilters';
import SidebarFiltersContent from '../../src/components/SidebarFiltersContent';
import FavoriteAssetsSection from '../../src/modules/favorites/components/FavoriteAssetsSection';
import { ImportAssetDialog } from '../../src/modules/orders/components/dialogs/ImportAssetDialog';

const FavoritesPage: NextPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [filters, setFilters] = useState({ myNfts: false });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleCloseDrawer = () => setIsFiltersOpen(false);
  const handleOpenDrawer = () => setIsFiltersOpen(true);

  const handleChangeFilters = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((value) => ({
      ...value,
      [e.target.name]: e.target.checked,
    }));
  };

  const renderSidebar = (onClose?: () => void) => {
    return (
      <SidebarFilters
        title={<FormattedMessage id="filters" defaultMessage="Filters" />}
        onClose={onClose}
      >
        <SidebarFiltersContent>
          <Stack>
            <FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.myNfts}
                    onChange={handleChangeFilters}
                    name="myNfts"
                  />
                }
                label={
                  <FormattedMessage id="my.nfts" defaultMessage="My NFTs" />
                }
              />
            </FormControl>
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

  const [showImportAsset, setShowImportAsset] = useState(false);

  const handleToggleImportAsset = () => setShowImportAsset((value) => !value);

  return (
    <>
      <ImportAssetDialog
        dialogProps={{
          open: showImportAsset,
          fullWidth: true,
          maxWidth: 'xs',
          onClose: handleToggleImportAsset,
        }}
      />
      {renderDrawer()}
      <MainLayout noSsr disablePadding>
        <Grid container>
          {isDesktop && (
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
                          <FormattedMessage
                            id="wallet"
                            defaultMessage="Wallet"
                          />
                        ),
                        uri: '/wallet',
                      },
                      {
                        caption: (
                          <FormattedMessage id="nfts" defaultMessage="NFTs" />
                        ),
                        uri: '/wallet/nfts',
                        active: true,
                      },
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FavoriteAssetsSection
                    filters={filters}
                    onOpenFilters={handleOpenDrawer}
                    onImport={handleToggleImportAsset}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </MainLayout>
    </>
  );
};

export default FavoritesPage;
