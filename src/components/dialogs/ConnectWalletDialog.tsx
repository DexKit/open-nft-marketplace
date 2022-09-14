import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogProps,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import metamaskIcon from '../../../public/assets/images/metamask-fox.svg';

import { FormattedMessage } from 'react-intl';
import walletConnectIcon from '../../../public/assets/images/walletconnect-circle-blue.svg';
import { useWalletActivate } from '../../hooks/misc';
import { AppDialogTitle } from '../AppDialogTitle';

interface Props {
  dialogProps: DialogProps;
}

function ConnectWalletDialog({ dialogProps }: Props) {
  const { onClose } = dialogProps;

  const walletActivate = useWalletActivate();

  const [connectorName, setConnectorName] = useState<string>();

  const handelClose = () => {
    onClose!({}, 'backdropClick');
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleActivateWallet = async (connectorName: string) => {
    setConnectorName(connectorName);
    await walletActivate.mutateAsync({ connectorName });
    handelClose();
    setConnectorName(undefined);
  };

  return (
    <Dialog {...dialogProps} onClose={handelClose}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="connect.your.wallet"
            defaultMessage={'Connect your Wallet'}
            description={'Connect wallet message'}
          />
        }
        onClose={handelClose}
      />
      <Divider />
      <DialogContent sx={{ padding: 0 }}>
        <List disablePadding>
          {!isMobile && (
            <ListItemButton
              divider
              disabled={
                walletActivate.isLoading && connectorName === 'metamask'
              }
              onClick={() => handleActivateWallet('metamask')}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: (theme) => theme.spacing(8),
                    display: 'flex',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {walletActivate.isLoading && connectorName === 'metamask' ? (
                    <CircularProgress
                      color="primary"
                      sx={{ fontSize: (theme) => theme.spacing(4) }}
                    />
                  ) : (
                    <Avatar
                      src={metamaskIcon.src}
                      sx={(theme) => ({
                        background: theme.palette.action.hover,
                        padding: theme.spacing(1),
                        width: 'auto',
                        height: theme.spacing(5),
                      })}
                      alt={'Metamask'}
                    />
                  )}
                </Box>
              </ListItemIcon>
              <ListItemText primary="MetaMask" />
            </ListItemButton>
          )}
          <ListItemButton
            disabled={
              walletActivate.isLoading && connectorName === 'walletConnect'
            }
            onClick={() => handleActivateWallet('walletConnect')}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: (theme) => theme.spacing(8),
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar
                  src={walletConnectIcon.src}
                  sx={(theme) => ({
                    background: theme.palette.action.hover,
                    padding: theme.spacing(1),
                    width: 'auto',
                    height: theme.spacing(5),
                  })}
                />
              </Box>
            </ListItemIcon>
            <ListItemText primary="WalletConnect" />
          </ListItemButton>
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectWalletDialog;
