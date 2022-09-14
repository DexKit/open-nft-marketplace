import { Box, CardMedia, Paper } from '@mui/material';
import Image from 'next/image';
import { useIntl } from 'react-intl';
import { ipfsUriToUrl } from '../../../utils/ipfs';

interface Props {
  src: string;
}

export function AssetImage({ src }: Props) {
  const { formatMessage } = useIntl();

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
          <Image
            src={ipfsUriToUrl(src)}
            layout="fill"
            objectFit="cover"
            alt={formatMessage({
              id: 'nft.image',
              defaultMessage: 'NFT Image',
            })}
          />
        </Box>
      </CardMedia>
    </Paper>
  );
}
