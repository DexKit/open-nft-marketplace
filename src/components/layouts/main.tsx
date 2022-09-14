import { Box, NoSsr } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect } from 'react';
import { Footer } from '../Footer';
import Navbar from '../Navbar';

import { useAtom } from 'jotai';
import {
  useConnectWalletDialog,
  useSignMessageDialog,
  useTransactions,
} from '../../hooks/app';
import {
  drawerIsOpenAtom,
  showSelectCurrencyAtom,
  showSelectLocaleAtom,
  switchNetworkChainIdAtom,
  switchNetworkOpenAtom,
} from '../../state/atoms';
import SignMessageDialog from '../dialogs/SignMessageDialog';
import { SwitchNetworkDialog } from '../dialogs/SwitchNetworkDialog';
import TransactionDialog from '../dialogs/TransactionDialog';

import { useRouter } from 'next/router';
import AppDrawer from '../AppDrawer';
import ConnectWalletDialog from '../dialogs/ConnectWalletDialog';
import SelectCurrencyDialog from '../dialogs/SelectCurrencyDialog';
import SelectLanguageDialog from '../dialogs/SelectLanguageDialog';

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  noSsr?: boolean;
  disablePadding?: boolean;
}

const MainLayout: React.FC<Props> = ({ children, noSsr, disablePadding }) => {
  const { connector, provider } = useWeb3React();
  const router = useRouter();

  const transactions = useTransactions();

  const [switchOpen, setSwitchOpen] = useAtom(switchNetworkOpenAtom);
  const [switchChainId, setSwitchChainId] = useAtom(switchNetworkChainIdAtom);

  const [showSelectCurrency, setShowShowSelectCurrency] = useAtom(
    showSelectCurrencyAtom
  );

  const [showSelectLocale, setShowShowSelectLocale] =
    useAtom(showSelectLocaleAtom);

  const connectWalletDialog = useConnectWalletDialog();

  const handleCloseConnectWalletDialog = () => {
    connectWalletDialog.setOpen(false);
  };

  const handleCloseTransactionDialog = () => {
    if (transactions.redirectUrl) {
      router.replace(transactions.redirectUrl);
    }
    transactions.setRedirectUrl(undefined);
    transactions.setDialogIsOpen(false);
    transactions.setHash(undefined);
    transactions.setType(undefined);
    transactions.setMetadata(undefined);
    transactions.setError(undefined);
  };

  const handleCloseSwitchNetworkDialog = () => {
    setSwitchChainId(undefined);
    setSwitchOpen(false);
  };

  const signMessageDialog = useSignMessageDialog();

  const handleCloseSignMessageDialog = () => {
    signMessageDialog.setOpen(false);
    signMessageDialog.setError(undefined);
    signMessageDialog.setIsSuccess(false);
    signMessageDialog.setMessage(undefined);
  };

  const handleCloseCurrencySelect = () => {
    setShowShowSelectCurrency(false);
  };

  const handleCloseLocaleSelect = () => {
    setShowShowSelectLocale(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      connector.activate();
      const handleNetworkChange = (newNetwork: any, oldNetwork: any) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network

        window.location.reload();
      };

      connector?.provider?.on('chainChanged', handleNetworkChange);

      return () => {
        connector?.provider?.removeListener(
          'chainChanged',
          handleNetworkChange
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useAtom(drawerIsOpenAtom);

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const render = () => (
    <>
      <AppDrawer open={isDrawerOpen} onClose={handleCloseDrawer} />
      <SelectCurrencyDialog
        dialogProps={{
          open: showSelectCurrency,
          onClose: handleCloseCurrencySelect,
          fullWidth: true,
          maxWidth: 'xs',
        }}
      />
      <SelectLanguageDialog
        dialogProps={{
          open: showSelectLocale,
          onClose: handleCloseLocaleSelect,
          fullWidth: true,
          maxWidth: 'xs',
        }}
      />
      <TransactionDialog
        dialogProps={{
          open: transactions.isOpen,
          onClose: handleCloseTransactionDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        hash={transactions.hash}
        metadata={transactions.metadata}
        type={transactions.type}
        error={transactions.error}
      />
      <SignMessageDialog
        dialogProps={{
          open: signMessageDialog.open,
          onClose: handleCloseSignMessageDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        error={signMessageDialog.error}
        success={signMessageDialog.isSuccess}
        message={signMessageDialog.message}
      />
      <SwitchNetworkDialog
        dialogProps={{
          open: switchOpen,
          onClose: handleCloseSwitchNetworkDialog,
          fullWidth: true,
          maxWidth: 'xs',
        }}
        chainId={switchChainId}
      />
      <ConnectWalletDialog
        dialogProps={{
          open: connectWalletDialog.isOpen,
          onClose: handleCloseConnectWalletDialog,
          fullWidth: true,
          maxWidth: 'sm',
        }}
      />
      <Navbar />
      <Box sx={{ minHeight: '100vh' }} py={disablePadding ? 0 : 4}>
        {children}
      </Box>
      <Footer />
    </>
  );

  if (noSsr) {
    return <NoSsr>{render()}</NoSsr>;
  }

  return render();
};

export default MainLayout;
