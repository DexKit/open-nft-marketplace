import { Grid, Skeleton } from '@mui/material';
import { useAsset, useAssetMetadata } from '../../../hooks/nft';
import { AssetDetails } from './AssetDetails';
import { AssetMedia } from './AssetMedia';

export function AssetLeftSection({
  address,
  id,
}: {
  address: string;
  id: string;
}) {
  const { data: asset } = useAsset(address, id);

  const { data: metadata } = useAssetMetadata(asset);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {asset ? <AssetMedia asset={asset} /> : <Skeleton />}
      </Grid>
      <Grid item xs={12}>
        <AssetDetails
          description={metadata?.description}
          address={address}
          id={id}
        />
      </Grid>
    </Grid>
  );
}

export default AssetLeftSection;
