import { Box, Container, Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import ActionButton from './ActionButton';

import { useWeb3React } from '@web3-react/core';
import connectWalletImage from '../../../../public/assets/images/connect-wallet-background.svg';

export function ActionButtonsSection() {
  const { isActive } = useWeb3React();

  if (!isActive) {
    return (
      <Box py={4}>
        <Container>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <ActionButton
                title={
                  <FormattedMessage
                    id="connect.wallet"
                    defaultMessage="Connect wallet"
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="connect.now"
                    defaultMessage="Connect now"
                  />
                }
                backgroundImage={connectWalletImage.src}
                href="/wallet/connect"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  } else {
    return null;
  }
}

export default ActionButtonsSection;
