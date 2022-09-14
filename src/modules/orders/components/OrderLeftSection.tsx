import { Grid, Skeleton } from '@mui/material';
import { useAsset, useAssetMetadata } from '../../../hooks/nft';
import { AssetDetails } from '../../nft/components/AssetDetails';
import { AssetMedia } from '../../nft/components/AssetMedia';

export function OrderLeftSection({
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

export default OrderLeftSection;
