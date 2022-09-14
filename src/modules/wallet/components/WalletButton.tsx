import {
  Avatar,
  ButtonBase,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

interface Props {
  src?: string;
  loading?: boolean;
  caption: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function WalletButton({
  loading,
  src,
  caption,
  onClick,
  disabled,
}: Props) {
  const theme = useTheme();
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      component={Paper}
      variant="outlined"
      sx={(theme) => ({
        p: 2,
        width: '100%',
        display: 'flex',
        borderRadius: theme.spacing(0.5),
        border: `1px solid ${theme.palette.divider}`,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      })}
    >
      <Grid
        container
        spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item>
          {loading ? (
            <CircularProgress size={theme.spacing(10)} />
          ) : (
            <Avatar
              sx={(theme) => ({
                width: theme.spacing(10),
                height: theme.spacing(10),
              })}
              src={src}
            />
          )}
        </Grid>
        <Grid item>
          <Typography
            variant="body1"
            sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
          >
            {caption}
          </Typography>
        </Grid>
      </Grid>
    </ButtonBase>
  );
}
