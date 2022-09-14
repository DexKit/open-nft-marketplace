import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  Stack,
} from '@mui/material';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CURRENCIES } from '../../constants';
import { currencyAtom } from '../../state/atoms';
import { Currency } from '../../types/app';
import { AppDialogTitle } from '../AppDialogTitle';

interface Props {
  dialogProps: DialogProps;
}

function SelectCurrencyDialog({ dialogProps }: Props) {
  const { onClose } = dialogProps;

  const [currency, setCurrency] = useAtom(currencyAtom);

  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
  };

  const handleSelectCurrency = (currency: string) => {
    setSelectedCurrency(currency);
  };

  const handleConfirmSelect = () => {
    setCurrency(selectedCurrency);
    handleClose();
  };

  return (
    <Dialog {...dialogProps} onClose={handleClose}>
      <AppDialogTitle
        title={
          <FormattedMessage
            id="select.currency"
            defaultMessage="Select currency"
            description="Select currency"
          />
        }
        onClose={handleClose}
      />
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack spacing={2}>
          <List disablePadding>
            {CURRENCIES.map((c: Currency, index: number) => (
              <ListItemButton
                onClick={() => handleSelectCurrency(c.symbol)}
                selected={c.symbol === selectedCurrency}
                key={index}
              >
                <ListItemText
                  primary={c.symbol.toUpperCase()}
                  secondary={c.name}
                />
                <ListItemSecondaryAction>
                  <Radio checked={c.symbol === selectedCurrency} />
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
          onClick={handleConfirmSelect}
        >
          <FormattedMessage
            id="Confirm"
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

export default SelectCurrencyDialog;
