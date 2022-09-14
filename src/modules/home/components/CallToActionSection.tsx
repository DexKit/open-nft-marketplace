import { Box, Button, Container, Grid, Typography } from '@mui/material';
import Link from '../../../components/Link';
import { CallToActionAppPageSection } from '../../../types/config';
import { AssetCardWithData } from '../../nft/components/AssetCardWidthData';
import CollectionCardWithData from './CollectionCardWithData';

interface Props {
  section: CallToActionAppPageSection;
}

export function CallToActionSection({ section }: Props) {
  const renderItems = () => {
    return section.items.map((item, index: number) => {
      if (item.type === 'asset' && item.tokenId !== undefined) {
        return (
          <Grid item xs={6} sm={3} key={index}>
            <AssetCardWithData
              address={item.contractAddress}
              id={item.tokenId}
            />
          </Grid>
        );
      } else if (item.type === 'collection') {
        return (
          <Grid item xs={12} sm={6} key={index}>
            <CollectionCardWithData
              contractAddress={item.contractAddress}
              chainId={item.chainId}
              title={item.title}
              backgroundImageUrl={item.backgroundImageUrl}
            />
          </Grid>
        );
      }
    });
  };

  return (
    <Box
      py={8}
      sx={(theme) => ({
        bgcolor:
          section.variant === 'dark'
            ? theme.palette.text.primary
            : theme.palette.background.default,
        color:
          section.variant === 'dark'
            ? theme.palette.background.default
            : theme.palette.text.primary,
      })}
    >
      <Container>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  color={section.variant === 'dark' ? 'secondary' : 'primary'}
                >
                  {section.subtitle}
                </Typography>
                <Typography color="inherit" variant="h2">
                  {section.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  LinkComponent={Link}
                  href={section.button.url}
                  variant="contained"
                  color="primary"
                >
                  {section.button.title}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {renderItems()}
        </Grid>
      </Container>
    </Box>
  );
}

export default CallToActionSection;
