import InstagramIcon from '@mui/icons-material/Instagram';

import {
  Box,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'; // always use @mui/material instead of @mui/system

import TwitterIcon from '@mui/icons-material/Twitter';
import { FormattedMessage } from 'react-intl';
import { getAppConfig } from '../services/app';
import { SocialMedia } from '../types/config';
import Link from './Link';

const appConfig = getAppConfig();

export function Footer() {
  const renderIcon = (media: SocialMedia) => {
    if (media.type === 'instagram') {
      return <InstagramIcon />;
    } else if (media.type === 'twitter') {
      return <TwitterIcon />;
    }
  };

  const renderLink = (media: SocialMedia) => {
    if (media.type === 'instagram') {
      return `https://instagram.com/${media.handle}`;
    } else if (media.type === 'twitter') {
      return `https://twitter.com/${media.handle}`;
    }

    return '';
  };

  return (
    <Box py={2} sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
      <Container>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
          spacing={2}
          sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
        >
          <Grid item>
            <Link
              href="https://dexkit.com/contact-us/"
              color="inherit"
              target="_blank"
            >
              <FormattedMessage
                id="contact.us"
                defaultMessage="Contact us"
                description="Contact us"
              />
            </Link>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center">
              <Link href="/" color="primary">
                {appConfig.name}
              </Link>{' '}
              <FormattedMessage
                defaultMessage="is powered by"
                id="is.powered.by"
                description="is powered by"
              />{' '}
              <Link variant="inherit" href="https://0x.org/" color="inherit">
                <strong>0x</strong>
              </Link>{' '}
              <FormattedMessage
                id="and.made.with.love.by"
                defaultMessage="and made with ❤️ by"
                description="and made with ❤️ by"
              />{' '}
              <Link
                variant="inherit"
                href="https://www.dexkit.com"
                target="_blank"
                color="inherit"
              >
                <strong>DexKit</strong>
              </Link>
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              {appConfig?.social &&
                appConfig.social.map((media, index) => (
                  <IconButton
                    key={index}
                    href={renderLink(media)}
                    LinkComponent={Link}
                    target="_blank"
                    size="small"
                  >
                    {renderIcon(media)}
                  </IconButton>
                ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
