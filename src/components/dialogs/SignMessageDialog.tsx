import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CloseCircle from '../icons/CloseCircle';
import ReceiptText from '../icons/ReceiptText';
import TickCircle from '../icons/TickCircle';

interface Props {
  dialogProps: DialogProps;
  error?: Error;
  success?: boolean;
  message?: string;
}

export function SignMessageDialog({
  dialogProps,
  error,
  success,
  message,
}: Props) {
  const { onClose } = dialogProps;

  const handleClose = () => onClose!({}, 'backdropClick');

  const renderContent = () => {
    if (error !== undefined) {
      return (
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <CloseCircle color="error" fontSize="large" />
          <Box>
            <Typography align="center" variant="h5">
              <FormattedMessage id="error" defaultMessage="Error" />
            </Typography>
            <Typography align="center" variant="body1" color="textSecondary">
              {error?.message}
            </Typography>
          </Box>
        </Stack>
      );
    } else {
      return (
        <Stack spacing={2} justifyContent="center" alignItems="center">
          {success ? (
            <TickCircle color="success" fontSize="large" />
          ) : (
            <CircularProgress />
          )}
          <Box>
            <Typography align="center" variant="h5">
              <FormattedMessage
                id="sign.message"
                defaultMessage="Sign message"
                description="Sign message "
              />
            </Typography>
            <Typography align="center" variant="body1" color="textSecondary">
              <FormattedMessage
                id="confirm.sign.message"
                defaultMessage="Please, sign the message on your wallet"
              />
            </Typography>
          </Box>
          <Typography align="center" variant="body2">
            {message}
          </Typography>
        </Stack>
      );
    }
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          alignItems: 'center',
          alignContent: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          alignContent="center"
        >
          <ReceiptText />
          <Typography variant="inherit">
            <FormattedMessage
              id="sign.message"
              defaultMessage="Sign Message"
              description="Sign message dialog title"
            />
          </Typography>
        </Stack>
        {onClose && (
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
}

export default SignMessageDialog;
