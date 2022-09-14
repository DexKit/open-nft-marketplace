import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { NETWORKS } from '../../constants/chain';
import { useSwitchNetworkMutation } from '../../hooks/blockchain';
import { Network } from '../../types/chains';
import { AppDialogTitle } from '../AppDialogTitle';

interface Props {
  dialogProps: DialogProps;
}

function SwitchNetworkDialog({ dialogProps }: Props) {
  const { onClose } = dialogProps;

  const [chainId, setChainId] = useState<number>();

  const switchNetworkMutation = useSwitchNetworkMutation();

  const handleClose = () => {
    onClose!({}, 'backdropClick');
    setChainId(undefined);
  };

  const handleSwitchNetwork = async () => {
    if (chainId !== undefined) {
      if (typeof chainId === 'number') {
        await switchNetworkMutation.mutateAsync({ chainId });
      } else if (typeof chainId === 'string') {
        await switchNetworkMutation.mutateAsync({
          chainId: parseInt('0x' + chainId, 16),
        });
      }

      handleClose();
    }
  };

  const handleSelectNetwork = (id: number) => {
    if (id === chainId) {
      return setChainId(undefined);
    }

    setChainId(id);
  };

  const handleReset = () => {
    switchNetworkMutation.reset();
  };

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="switch.network"
            defaultMessage="Switch Network"
            description="Switch network dialog title"
          />
        }
        onClose={handleClose}
      />
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack spacing={2}>
          {switchNetworkMutation.isError && (
            <Alert severity="error" onClose={handleReset}>
              {switchNetworkMutation.error?.message}
            </Alert>
          )}
          <List disablePadding>
            {Object.keys(NETWORKS)
              .filter((k) => !NETWORKS[parseInt(k)].testnet)
              .map((key: any, index: number) => (
                <ListItemButton
                  disabled={switchNetworkMutation.isLoading}
                  selected={(NETWORKS[key] as Network).chainId === chainId}
                  key={index}
                  onClick={() =>
                    handleSelectNetwork((NETWORKS[key] as Network).chainId)
                  }
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: (theme) => theme.spacing(6),
                        display: 'flex',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        src={(NETWORKS[key] as Network).imageUrl}
                        sx={(theme) => ({
                          width: 'auto',
                          height: theme.spacing(4),
                        })}
                        alt={(NETWORKS[key] as Network).name}
                      />
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={(NETWORKS[key] as Network).name}
                    secondary={(NETWORKS[key] as Network).symbol}
                  />
                  <ListItemSecondaryAction>
                    <Radio
                      name="chainId"
                      checked={(NETWORKS[key] as Network).chainId === chainId}
                    />
                  </ListItemSecondaryAction>
                </ListItemButton>
              ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={switchNetworkMutation.isLoading || chainId === undefined}
          startIcon={
            switchNetworkMutation.isLoading ? (
              <CircularProgress color="inherit" size="1rem" />
            ) : undefined
          }
          onClick={handleSwitchNetwork}
        >
          <FormattedMessage
            id="switch"
            defaultMessage="Switch"
            description="switch"
          />
        </Button>
        <Button
          disabled={switchNetworkMutation.isLoading}
          onClick={handleClose}
        >
          <FormattedMessage
            id="cancel"
            defaultMessage="Cancel"
            description="Cancel"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchNetworkDialog;
