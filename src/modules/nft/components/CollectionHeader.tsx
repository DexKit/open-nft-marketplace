import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Box from '@mui/material/Box';

import { useMemo } from 'react';
import { ChainId } from '../../../constants/enum';
import { useCollection } from '../../../hooks/nft';
import { getAppConfig } from '../../../services/app';
import { isAddressEqual } from '../../../utils/blockchain';

import { styled } from '@mui/material';
import Image from 'next/image';

const Img = styled(Image)({});

interface Props {
  address: string;
  chainId?: ChainId;
}

const appConfig = getAppConfig();

export function CollectionHeader(props: Props) {
  const { address, chainId } = props;
  const { data: collection } = useCollection(address, chainId);

  const collectionImage = useMemo(() => {
    return appConfig.collections?.find(
      (c) =>
        c.chainId === collection?.chainId &&
        isAddressEqual(c.contractAddress, collection?.contractAddress)
    )?.backgroundImage;
  }, [collection]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                algnItems: 'center',
                alignContent: 'center',
                justifyContent: { xs: 'center', sm: 'left' },
              }}
            >
              {collectionImage ? (
                <Box
                  sx={(theme) => ({
                    position: 'relative',
                    height: theme.spacing(14),
                    width: theme.spacing(14),
                    borderRadius: '50%',
                  })}
                >
                  <Img
                    src={collectionImage}
                    layout="fill"
                    sx={{ borderRadius: '50%' }}
                    alt={collection?.collectionName || ''}
                  />
                </Box>
              ) : (
                <Avatar
                  sx={(theme) => ({
                    height: theme.spacing(14),
                    width: theme.spacing(14),
                  })}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography
              sx={{
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                textAlign: { xs: 'center', sm: 'left' },
              }}
              variant="h5"
              component="h1"
            >
              {collection?.collectionName}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
