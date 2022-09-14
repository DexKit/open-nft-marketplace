import { ImportExport, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import CloseCircle from '../../../components/icons/CloseCircle';
import Funnel from '../../../components/icons/Filter';
import { useFavoriteAssets } from '../../../hooks/nft';
import { Asset } from '../../../types/nft';
import { isAddressEqual } from '../../../utils/blockchain';
import { AssetCard } from '../../nft/components/AssetCard';
import RemoveFavoriteDialog from './RemoveFavoriteDialog';

interface Props {
  onOpenFilters?: () => void;
  filters?: { myNfts: boolean };
  onImport: () => void;
}

function FavoriteAssetsSection({ onOpenFilters, filters, onImport }: Props) {
  const { account } = useWeb3React();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset>();

  const { formatMessage } = useIntl();

  const { enqueueSnackbar } = useSnackbar();

  const { assets, toggleFavorite, isFavorite } = useFavoriteAssets();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleToggleFavorite = useCallback(
    (asset: Asset) => {
      setSelectedAsset(asset);
      setIsOpen(true);
    },
    [toggleFavorite]
  );

  const assetList = useMemo(() => {
    return Object.keys(assets).map((key) => assets[key]);
  }, [assets]);

  const renderAssets = () => {
    const filteredAssetList = assetList
      .filter((asset) => {
        return (
          asset.collectionName?.toLowerCase().search(search.toLowerCase()) >
            -1 ||
          (asset.metadata !== undefined &&
            asset.metadata.name.toLowerCase().search(search.toLowerCase()) > -1)
        );
      })
      .filter((asset) => {
        if (filters?.myNfts) {
          return isAddressEqual(asset.owner, account);
        }

        return true;
      });

    if (filteredAssetList.length === 0) {
      return (
        <Grid item xs={12}>
          <Box sx={{ py: 4 }}>
            <Stack
              justifyContent="center"
              alignItems="center"
              alignContent="center"
              spacing={2}
            >
              <CloseCircle color="error" />
              <Box>
                <Typography align="center" variant="h5">
                  <FormattedMessage
                    id="no.nfts.found"
                    defaultMessage="No NFTs"
                  />
                </Typography>

                <Typography
                  align="center"
                  variant="body1"
                  color="textSecondary"
                >
                  <FormattedMessage
                    id="import.or.favorite.nfts"
                    defaultMessage="Import or favorite NFTs"
                  />
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      );
    }

    return filteredAssetList.map((asset, index) => (
      <Grid item xs={6} sm={3} key={index}>
        <AssetCard
          asset={asset}
          key={index}
          onFavorite={handleToggleFavorite}
          isFavorite={isFavorite(asset)}
        />
      </Grid>
    ));
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedAsset(undefined);
  };

  const handleConfirm = () => {
    toggleFavorite(selectedAsset);
    enqueueSnackbar(
      formatMessage({
        defaultMessage: 'NFT removed from your favorites',
        id: 'nft.removed.from.your.favorites',
      }),
      {
        variant: 'success',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
      }
    );
    setIsOpen(false);
    setSelectedAsset(undefined);
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <RemoveFavoriteDialog
        dialogProps={{ open: isOpen, onClose: handleCloseDialog }}
        onConfirm={handleConfirm}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {isDesktop ? (
            <Stack
              direction="row"
              justifyContent="start"
              alignItems="center"
              alignContent="center"
              spacing={2}
            >
              <TextField
                type="search"
                size="small"
                value={search}
                onChange={handleChange}
                placeholder={formatMessage({
                  id: 'search.for.a.nft',
                  defaultMessage: 'Search for a NFT',
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                startIcon={<ImportExport />}
                onClick={onImport}
                variant="outlined"
                color="primary"
              >
                <FormattedMessage id="import.nft" defaultMessage="Import NFT" />
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                alignContent="center"
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  alignContent="center"
                >
                  <Button
                    startIcon={<ImportExport />}
                    onClick={onImport}
                    variant="outlined"
                    color="primary"
                  >
                    <FormattedMessage
                      id="import.nft"
                      defaultMessage="Import NFT"
                    />
                  </Button>
                  <Chip
                    label={
                      <>
                        {assetList.length}{' '}
                        <FormattedMessage id="nfts" defaultMessage="NFTs" />
                      </>
                    }
                    color="secondary"
                  />
                </Stack>
                <IconButton onClick={onOpenFilters}>
                  <Funnel />
                </IconButton>
              </Stack>

              <TextField
                type="search"
                size="small"
                value={search}
                onChange={handleChange}
                placeholder={formatMessage({
                  id: 'search.for.a.nft',
                  defaultMessage: 'Search for a NFT',
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          )}
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {renderAssets()}
      </Grid>
    </>
  );
}

export default FavoriteAssetsSection;
