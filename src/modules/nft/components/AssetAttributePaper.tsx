import { Box, Paper, Stack, Typography } from '@mui/material';

interface Props {
  traitType: string;
  value: string;
}

export function AssetAttributePaper({ traitType, value }: Props) {
  return (
    <Paper
      component="div"
      sx={{
        p: 0.5,
      }}
    >
      <Stack sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
        <Typography
          color="textSecondary"
          variant="caption"
          noWrap
          sx={{
            textTransform: 'capitalize',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {traitType}
        </Typography>
        <Box
          sx={(theme) => ({
            background: theme.palette.action.hover,
            borderRadius: theme.spacing(1),
            padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
          })}
        >
          <Typography
            noWrap
            variant="body2"
            sx={{
              fontWeight: 600,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
            title={value}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default AssetAttributePaper;
