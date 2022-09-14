import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';
import { QueryErrorResetBoundary } from 'react-query';
import { WalletTotalBalance } from './WalletTotalBalance';

export function WalletTotalBalanceCointainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <Stack justifyContent="center" alignItems="center">
              <Typography variant="h6">
                <FormattedMessage
                  id="something.went.wrong"
                  defaultMessage="Oops, something went wrong"
                  description="Something went wrong error message"
                />
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {String(error)}
              </Typography>
              <Button color="primary" onClick={resetErrorBoundary}>
                <FormattedMessage
                  id="try.again"
                  defaultMessage="Try again"
                  description="Try again"
                />
              </Button>
            </Stack>
          )}
        >
          <Suspense fallback={<Skeleton />}>
            <WalletTotalBalance />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
