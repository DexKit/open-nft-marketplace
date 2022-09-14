import FileCopyIcon from '@mui/icons-material/FileCopy';
import ShareIcon from '@mui/icons-material/Share';

import {
  Dialog,
  DialogContent,
  DialogProps,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { AppDialogTitle } from '../../../../components/AppDialogTitle';
import { CopyIconButton } from '../../../../components/CopyIconButton';
import { copyToClipboard } from '../../../../utils/browser';

interface Props {
  dialogProps: DialogProps;
  url?: string;
}

function ShareDialog({ dialogProps, url }: Props) {
  const { onClose } = dialogProps;

  const { formatMessage } = useIntl();

  const handleClose = () => {
    onClose!({}, 'backdropClick');
  };

  const handleCopy = () => {
    if (url !== undefined) {
      copyToClipboard(url);
    }
  };

  return (
    <Dialog {...dialogProps}>
      <AppDialogTitle
        icon={<ShareIcon />}
        title={
          <FormattedMessage
            id="share"
            defaultMessage="Share"
            description="Share dialog title"
          />
        }
        onClose={handleClose}
      />
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              value={url}
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
                      <FileCopyIcon />
                    </CopyIconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
