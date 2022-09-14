import { ButtonBase, Stack, Typography } from '@mui/material';
import Link from '../../../components/Link';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface Props {
  title: React.ReactNode | React.ReactNode[];
  subtitle: React.ReactNode | React.ReactNode[];
  backgroundImage: string;
  href: string;
}

export function ActionButton({
  title,
  subtitle,
  backgroundImage,
  href,
}: Props) {
  return (
    <ButtonBase
      sx={{
        background: (theme) => theme.palette.background.paper,
        borderRadius: (theme) => theme.shape.borderRadius,
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right',
        width: '100%',
        display: 'flex',
        p: 2,
        flexDirection: 'column',
        textAlign: 'left',
        alignContent: 'stretch',
        alignItems: 'flex-start',
      }}
      LinkComponent={Link}
      href={href}
    >
      <Typography variant="h4">{title}</Typography>
      <Stack direction="row" alignItems="center" alignContent="center">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          color="textSecondary"
        >
          {subtitle}
        </Typography>
        <ChevronRightIcon color="primary" fontSize="small" />
      </Stack>
    </ButtonBase>
  );
}

export default ActionButton;
