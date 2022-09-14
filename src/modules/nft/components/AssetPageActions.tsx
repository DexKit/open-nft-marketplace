import {
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

import { Share } from '@mui/icons-material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import Heart from '../../../components/icons/Heart';
import Link from '../../../components/Link';
import {
  useAsset,
  useAssetMetadata,
  useFavoriteAssets,
} from '../../../hooks/nft';
import {
  getBlockExplorerUrl,
  getNetworkSlugFromChainId,
  isAddressEqual,
  truncateAddress,
} from '../../../utils/blockchain';
import { getWindowUrl } from '../../../utils/browser';
import ShareDialog from './dialogs/ShareDialog';

interface Props {
  address: string;
  id: string;
}

export function AssetPageActions({ address, id }: Props) {
  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  const { account } = useWeb3React();

  const favorites = useFavoriteAssets();

  const handleToggleFavorite = () => {
    if (asset !== undefined) {
      favorites.toggleFavorite({ ...asset, metadata });
    }
  };

  const [openShare, setOpenShare] = useState(false);

  const handleCloseShareDialog = () => setOpenShare(false);

  const handleOpenShareDialog = () => setOpenShare(true);

  return (
    <>
      <ShareDialog
        dialogProps={{
          open: openShare,
          fullWidth: true,
          maxWidth: 'sm',
          onClose: handleCloseShareDialog,
        }}
        url={`${getWindowUrl()}/asset/${getNetworkSlugFromChainId(
          asset?.chainId
        )}/${address}/${id}`}
      />
      <Grid container spacing={2} alignItems="stretch" alignContent="center">
        <Grid item xs>
          <Paper variant="outlined" sx={{ p: 1, height: '100%' }}>
            <Typography variant="caption" color="textSecondary">
              <FormattedMessage id="owned.by" defaultMessage="Owned by" />
            </Typography>
            <Link
              href={`${getBlockExplorerUrl(asset?.chainId)}/address/${
                asset?.owner
              }`}
              color="primary"
              target="_blank"
            >
              <Stack
                component="span"
                direction="row"
                alignItems="center"
                alignContent="center"
                spacing={0.5}
              >
                <div>
                  {isAddressEqual(account, asset?.owner) ? (
                    <FormattedMessage id="you" defaultMessage="you" />
                  ) : (
                    truncateAddress(asset?.owner)
                  )}
                </div>
                <LaunchIcon fontSize="inherit" />
              </Stack>
            </Link>
          </Paper>
        </Grid>
        <Grid item>
          <Paper variant="outlined" sx={{ p: 1, height: '100%' }}>
            <Stack
              direction="row"
              sx={{ height: '100%' }}
              divider={<Divider flexItem orientation="vertical" />}
              alignItems="center"
              spacing={2}
            >
              <Tooltip
                title={
                  <FormattedMessage id="favorite" defaultMessage="Favorite" />
                }
              >
                <IconButton onClick={handleToggleFavorite}>
                  <Heart
                    sx={
                      favorites.isFavorite(asset)
                        ? (theme) => ({
                            '& path': { fill: theme.palette.error.light },
                          })
                        : undefined
                    }
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={handleOpenShareDialog}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
