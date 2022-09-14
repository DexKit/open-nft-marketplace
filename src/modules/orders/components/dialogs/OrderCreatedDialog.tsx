import Launch from '@mui/icons-material/Launch';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { PostOrderResponsePayload } from '@traderxyz/nft-swap-sdk/dist/sdk/v4/orderbook';
import { FormattedMessage } from 'react-intl';
import { AppDialogTitle } from '../../../../components/AppDialogTitle';
import TickCircle from '../../../../components/icons/TickCircle';
import Link from '../../../../components/Link';
import { getNetworkSlugFromChainId } from '../../../../utils/blockchain';

interface Props {
  dialogProps: DialogProps;
  order?: PostOrderResponsePayload;
}

export default function OrderCreatedDialog({ dialogProps, order }: Props) {
  const { onClose } = dialogProps;

  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        title={
          <FormattedMessage id="order.created" defaultMessage="Order Created" />
        }
        onClose={handleClose}
      />
      <Divider />
      <DialogContent>
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <TickCircle color="success" fontSize="large" />
          <Box>
            <Typography
              align="center"
              variant="subtitle1"
              sx={{ fontWeight: 600 }}
            >
              <FormattedMessage
                id="order.created"
                defaultMessage="Order #{id} Created"
                values={{
                  id: order?.order?.nonce.substring(
                    order?.order?.nonce.length - 8
                  ),
                }}
              />
            </Typography>
            <Typography variant="body1" color="textSecondary">
              <FormattedMessage
                id="your.order.was.created.successfully"
                defaultMessage="Your order was created successfully"
              />
            </Typography>
          </Box>
          <Button
            LinkComponent={Link}
            target="_blank"
            href={`/order/${getNetworkSlugFromChainId(
              parseInt(order?.chainId || '0')
            )}/${order?.order.nonce}`}
            variant="contained"
            color="primary"
            fullWidth
            endIcon={<Launch />}
          >
            <FormattedMessage id="view.order" defaultMessage="View Order" />
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
