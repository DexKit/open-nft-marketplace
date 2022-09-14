import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';

import { Search } from '@mui/icons-material';
import {
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  NoSsr,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { Suspense, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { dehydrate, QueryClient } from 'react-query';
import { AppErrorBoundary } from '../../../../src/components/AppErrorBoundary';
import Funnel from '../../../../src/components/icons/Filter';
import MainLayout from '../../../../src/components/layouts/main';
import SidebarFilters from '../../../../src/components/SidebarFilters';
import SidebarFiltersContent from '../../../../src/components/SidebarFiltersContent';
import {
  ASSETS_FROM_ORDERBOOK,
  GET_COLLECTION_DATA,
  useCollection,
} from '../../../../src/hooks/nft';
import { AssetList } from '../../../../src/modules/nft/components/AssetList';
import { CollectionHeader } from '../../../../src/modules/nft/components/CollectionHeader';
import CollectionPageHeader from '../../../../src/modules/nft/components/CollectionPageHeader';
import TableSkeleton from '../../../../src/modules/nft/components/tables/TableSkeleton';
import {
  getAssetsFromOrderbook,
  getCollectionData,
} from '../../../../src/services/nft';
import { getProviderBySlug } from '../../../../src/services/providers';
import { getChainIdFromName } from '../../../../src/utils/blockchain';
import { TraderOrderFilter } from '../../../../src/utils/types';

const CollectionPage: NextPage = () => {
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { address, network } = router.query;
  const chainId = getChainIdFromName(network as string)?.chainId;
  const [search, setSearch] = useState<string>();

  const { data: collection } = useCollection(address as string, chainId);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleCloseDrawer = () => setIsFiltersOpen(false);
  const handleOpenDrawer = () => setIsFiltersOpen(true);

  const renderSidebar = (onClose?: () => void) => {
    return (
      <SidebarFilters
        title={<FormattedMessage id="filters" defaultMessage="Filters" />}
        onClose={onClose}
      >
        <SidebarFiltersContent>
          <TextField
            fullWidth
            size="small"
            type="search"
            value={search}
            onChange={handleChangeSearch}
            placeholder={formatMessage({
              id: 'search.in.collection',
              defaultMessage: 'Search in collection',
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />
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

  return (
    <>
      <NextSeo title={collection?.collectionName} />
      {renderDrawer()}
      <NextSeo title={`${collection?.collectionName}`} />
      <MainLayout disablePadding>
        <Grid container>
          {isDesktop && (
            <Grid item xs={12} sm={2}>
              {renderSidebar()}
            </Grid>
          )}
          <Grid item xs={12} sm={10}>
            <Box p={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CollectionPageHeader
                    chainId={chainId}
                    address={address as string}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CollectionHeader
                        address={address as string}
                        chainId={chainId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack
                        justifyContent="space-between"
                        direction="row"
                        alignItems="center"
                        alignContent="center"
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          <FormattedMessage
                            id="collection"
                            defaultMessage="Collection"
                            description="collection"
                          />
                        </Typography>
                        <Box>
                          {!isDesktop && (
                            <IconButton onClick={handleOpenDrawer}>
                              <Funnel />
                            </IconButton>
                          )}
                        </Box>
                      </Stack>
                    </Grid>
                    {!isDesktop && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          type="search"
                          value={search}
                          onChange={handleChangeSearch}
                          placeholder={formatMessage({
                            id: 'search.in.collection',
                            defaultMessage: 'Search in collection',
                          })}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Search color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <NoSsr>
                        <AppErrorBoundary
                          fallbackRender={({ resetErrorBoundary, error }) => (
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
                          )}
                        >
                          <Suspense fallback={<TableSkeleton rows={4} />}>
                            <AssetList
                              contractAddress={address as string}
                              search={search}
                            />
                          </Suspense>
                        </AppErrorBoundary>
                      </NoSsr>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </MainLayout>
    </>
  );
};

export const getStaticProps = async (context: any) => {
  const { address, network } = context.params;

  const queryClient = new QueryClient();

  const provider = getProviderBySlug(network as string);

  const collection = await getCollectionData(provider, address as string);

  await queryClient.prefetchQuery(
    [
      GET_COLLECTION_DATA,
      address as string,
      (await provider?.getNetwork())?.chainId,
    ],
    async () => {
      return collection;
    }
  );

  const filters: TraderOrderFilter = { nftToken: address };

  const assets = await getAssetsFromOrderbook(provider, filters);

  await queryClient.prefetchQuery(
    [ASSETS_FROM_ORDERBOOK, filters],
    async () => assets
  );

  return { props: { dehydratedState: dehydrate(queryClient) }, revalidate: 60 };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking', // false or 'blocking'
  };
}

export default CollectionPage;
