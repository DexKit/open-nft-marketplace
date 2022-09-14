import {
  Breadcrumbs,
  IconButton,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from './Link';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useRouter } from 'next/router';

interface Props {
  breadcrumbs: { caption: React.ReactNode; uri: string; active?: boolean }[];
}

const CustomLink = styled(Link)({
  fontWeight: 600,
  textDecoration: 'none',
});

export function PageHeader({ breadcrumbs }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const renderActiveBreadcrumb = () => {
    const breadcrumb = breadcrumbs.find((b) => b.active);

    if (breadcrumb) {
      return (
        <Typography
          sx={{
            display: 'block',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontWeight: 600,
          }}
          variant="h6"
        >
          {breadcrumb.caption}
        </Typography>
      );
    }
    return;
  };

  const handleGoBack = () => router.back();

  return (
    <Stack>
      {isMobile ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          alignContent="center"
        >
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>

          {renderActiveBreadcrumb()}
        </Stack>
      ) : (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" color="inherit" />}
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <CustomLink
              key={index}
              href={breadcrumb.uri}
              color={breadcrumb?.active ? 'primary' : 'text.primary'}
            >
              {breadcrumb.caption}
            </CustomLink>
          ))}
        </Breadcrumbs>
      )}
    </Stack>
  );
}
