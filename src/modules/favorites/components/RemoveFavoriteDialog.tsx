import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AppDialogTitle } from '../../../components/AppDialogTitle';
import { Asset } from '../../../types/nft';

interface Props {
  dialogProps: DialogProps;
  chainId?: number;
  onConfirm: () => void;
  asset?: Asset;
}

function RemoveFavoriteDialog({ dialogProps, onConfirm }: Props) {
  const { onClose } = dialogProps;

  const handleClose = () => onClose!({}, 'backdropClick');

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="remove.nft"
            defaultMessage="Remove NFT"
            description="Remove nft dialog title"
          />
        }
        onClose={handleClose}
      />
      <DialogContent dividers>
        <FormattedMessage
          id="do.you.want.to.remove.nft"
          defaultMessage="Do you want to remove this NFT from your favorites?"
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          <FormattedMessage
            id="confirm"
            defaultMessage="Confirm"
            description="Confirm"
          />
        </Button>
        <Button onClick={handleClose}>
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

export default RemoveFavoriteDialog;
