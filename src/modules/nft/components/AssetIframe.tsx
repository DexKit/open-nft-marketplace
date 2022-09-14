import { Box, CardMedia, Paper } from '@mui/material';

interface Props {
  src: string;
}

export function AssetIframe({ src }: Props) {
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
          <iframe
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            frameBorder={'0'}
            height="100%"
            sandbox="allow-scripts"
            src={src}
            width="100%"
          />
        </Box>
      </CardMedia>
    </Paper>
  );
}
