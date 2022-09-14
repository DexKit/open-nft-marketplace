import { Box, Container, Grid, Typography } from '@mui/material';
import LazyYoutubeFrame from '../../../components/LazyYoutubeFrame';
import { VideoEmbedType } from '../../../types/config';

interface Props {
  embedType?: VideoEmbedType;
  videoUrl?: string;
  title?: string;
}

export function VideoSection({ embedType, title, videoUrl }: Props) {
  const renderVideo = () => {
    if (embedType === 'youtube') {
      return <LazyYoutubeFrame url={videoUrl} title={title} />;
    }
  };

  return (
    <Box sx={{ py: 6 }}>
      <Container>
        <Grid
          container
          spacing={2}
          alignContent="center"
          justifyContent="center"
        >
          <Grid item xs={12} sm={6}>
            {renderVideo()}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center">
              {title}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default VideoSection;
