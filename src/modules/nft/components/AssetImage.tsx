import { Box, CardMedia, Paper } from '@mui/material';
import Image from 'next/future/image';
import { useIntl } from 'react-intl';
import { ipfsUriToUrl } from '../../../utils/ipfs';

interface Props {
  src: string;
}

export function AssetImage({ src }: Props) {
  const { formatMessage } = useIntl();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%',
      }}
    >
      <Image
        src={ipfsUriToUrl(src)}
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
        fill
        alt={formatMessage({
          id: 'nft.image',
          defaultMessage: 'NFT Image',
        })}
      />
    </Box>
  );
}
