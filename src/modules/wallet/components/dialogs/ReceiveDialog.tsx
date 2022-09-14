import { FileCopy, Share } from '@mui/icons-material';

import {
  Dialog,
  DialogContent,
  DialogProps,
  Divider,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AppDialogTitle } from '../../../../components/AppDialogTitle';
import { CopyIconButton } from '../../../../components/CopyIconButton';
import { copyToClipboard } from '../../../../utils/browser';

interface Props {
  dialogProps: DialogProps;
  account?: string;
}

export function ReceiveDialog({ dialogProps, account }: Props) {
  const { onClose } = dialogProps;
  const handleClose = () => onClose!({}, 'backdropClick');

  const { formatMessage } = useIntl();

  const handleCopy = () => {
    if (account !== undefined) {
      copyToClipboard(account);
    }
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        icon={<Share />}
        title={
          <FormattedMessage
            id="share.your.address"
            defaultMessage="Share your address"
          />
        }
        onClose={handleClose}
      />
      <Divider />
      <DialogContent>
        <Stack
          spacing={2}
          justifyContent="center"
          alignItems="center"
          alignContent="center"
        >
          {account !== undefined && <QRCodeSVG value={account} />}
          <TextField
            fullWidth
            value={account}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CopyIconButton
                    iconButtonProps={{
                      onClick: handleCopy,
                      size: 'small',
                    }}
                    tooltip={formatMessage({
                      id: 'copy',
                      defaultMessage: 'Copy',
                      description: 'Copy text',
                    })}
                    activeTooltip={formatMessage({
                      id: 'copied',
                      defaultMessage: 'Copied!',
                      description: 'Copied text',
                    })}
                  >
                    <FileCopy />
                  </CopyIconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiveDialog;
