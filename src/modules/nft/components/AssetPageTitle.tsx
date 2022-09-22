import { Box, Stack, Typography } from '@mui/material';

import { useAsset, useAssetMetadata } from '../../../hooks/nft';
import { truncateErc1155TokenId } from '../../../utils/nfts';

interface Props {
  address: string;
  id: string;
}

export function AssetPageTitle({ address, id }: Props) {
  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  return (
    <Stack
      direction="row"
      alignItems="center"
      alignContent="center"
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="caption" color="textSecondary">
          {asset?.collectionName}
        </Typography>
        <Typography variant="h5" component="h1">
          {metadata?.name !== '' && metadata?.name !== undefined
            ? metadata?.name
            : `${asset?.collectionName} #${truncateErc1155TokenId(asset?.id)}`}
        </Typography>
      </Box>
    </Stack>
  );
}
