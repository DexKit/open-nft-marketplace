import { Button, styled } from '@mui/material';

export const WalletActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  textTransform: 'none',
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
}));

export default WalletActionButton;
