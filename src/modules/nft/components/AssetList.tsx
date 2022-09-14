import { Button, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from '../../../components/Link';

import { useAssetsFromOrderbook } from '../../../hooks/nft';
import { AssetCard } from './AssetCard';

interface Props {
  contractAddress: string;
  search?: string;
}

export function AssetList({ contractAddress, search }: Props) {
  const { data: assets } = useAssetsFromOrderbook({
    nftToken: contractAddress as string,
  });

  const filteredAssets = useMemo(() => {
    return assets;
  }, [search]);

  return (
    <Grid container spacing={2}>
      {filteredAssets?.map((asset, index) => (
        <Grid item xs={6} sm={2} key={index}>
          <AssetCard asset={asset} lazyLoadMetadata />
        </Grid>
      ))}
      {filteredAssets?.length === 0 && (
        <Grid item xs={12} sm={12}>
          <Stack justifyContent="center" alignItems="center">
            <Typography variant="h6">
              <FormattedMessage
                id="no.available.offers"
                defaultMessage="No Available offers"
                description="No Available offers message"
              />
            </Typography>
            <Typography variant="body1" color="textSecondary">
              <FormattedMessage
                id="start.posting.offers.collection"
                defaultMessage="Start posting offers for this collection"
                description="Start posting offers for this collection"
              />
            </Typography>
            <Button
              LinkComponent={Link}
              href="/order/create"
              color="primary"
              variant="contained"
            >
              <FormattedMessage
                id="post.offers"
                defaultMessage="Post offers"
                description="Post offers"
              />
            </Button>
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
