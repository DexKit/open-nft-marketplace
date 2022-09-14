import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Skeleton,
  styled,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Heart from '../../../components/icons/Heart';
import Link from '../../../components/Link';
import { useAssetMetadata } from '../../../hooks/nft';
import { Asset } from '../../../types/nft';
import { getNetworkSlugFromChainId } from '../../../utils/blockchain';
import { ipfsUriToUrl } from '../../../utils/ipfs';

const Img = styled('img')({});

interface Props {
  asset?: Asset;
  onFavorite?: (asset: Asset) => void;
  isFavorite?: boolean;
  lazyLoadMetadata?: boolean;
}

export function AssetCard({
  asset,
  onFavorite,
  isFavorite,
  lazyLoadMetadata,
}: Props) {
  const { formatMessage } = useIntl();

  const { data: metadata } = useAssetMetadata(asset, {
    enabled: lazyLoadMetadata,
  });

  const [assetName, assetImage] = useMemo(() => {
    if (metadata) {
      return [metadata.name, metadata.image];
    } else if (asset?.metadata) {
      return [asset?.metadata.name, asset?.metadata.image];
    }

    return [];
  }, [metadata, asset]);

  return (
    <Card sx={{ position: 'relative', heigh: '100%' }}>
      <CardActionArea
        LinkComponent={Link}
        href={`/asset/${getNetworkSlugFromChainId(asset?.chainId)}/${
          asset?.contractAddress
        }/${asset?.id}`}
      >
        {assetImage ? (
          <CardMedia
            sx={{
              height: (theme) => ({
                xs: theme.spacing(24),
                sm: theme.spacing(34),
              }),
            }}
          >
            <div
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              <Image
                alt={formatMessage({
                  id: 'nft.image',
                  defaultMessage: 'NFT Image',
                })}
                src={ipfsUriToUrl(assetImage || '')}
                layout="fill"
                objectFit="cover"
              />
            </div>
          </CardMedia>
        ) : (
          <Skeleton
            variant="rectangular"
            sx={{
              display: 'block',
              width: '100%',
              height: (theme) => ({
                xs: theme.spacing(24),
                sm: theme.spacing(34),
              }),
            }}
          />
        )}
        <CardContent>
          <Typography variant="caption">{asset?.collectionName}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {assetName}
          </Typography>
        </CardContent>
      </CardActionArea>
      {onFavorite && isFavorite && asset && (
        <IconButton
          sx={(theme) => ({
            top: theme.spacing(2),
            left: theme.spacing(2),
            position: 'absolute',
          })}
          onClick={() => onFavorite(asset)}
        >
          <Heart
            sx={
              isFavorite
                ? (theme) => ({
                    '& path': { fill: theme.palette.error.light },
                  })
                : undefined
            }
          />
        </IconButton>
      )}
    </Card>
  );
}
