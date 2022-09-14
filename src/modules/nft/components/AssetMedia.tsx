import { Box, CardMedia, Paper, Skeleton } from '@mui/material';
import { useAssetMetadata } from '../../../hooks/nft';
import { Asset } from '../../../types/nft';
import { getNFTMediaSrcAndType } from '../../../utils/nfts';
import { AssetIframe } from './AssetIframe';
import { AssetImage } from './AssetImage';

interface Props {
  asset: Asset;
}

export function AssetMedia({ asset }: Props) {
  const { data: metadata, isLoading } = useAssetMetadata(asset);

  if (isLoading) {
    return <Skeleton />;
  }

  const nftSrcAndType = getNFTMediaSrcAndType(
    asset.contractAddress,
    asset.chainId,
    asset.id
  );

  return (
    <Paper sx={{ maxWidth: '100%', height: 'auto' }}>
      <CardMedia
        component="div"
        sx={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: (theme) => theme.spacing(36),
          }}
        >
          {nftSrcAndType.type === 'image' && metadata?.image && (
            <AssetImage src={metadata?.image} />
          )}
          {nftSrcAndType.type === 'iframe' && nftSrcAndType.src && (
            <AssetIframe src={nftSrcAndType.src} />
          )}
        </Box>
      </CardMedia>
    </Paper>
  );
}
