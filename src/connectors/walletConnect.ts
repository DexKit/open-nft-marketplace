import { initializeConnector } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect';
import { NETWORKS } from '../constants/chain';


const rpcs: { [key: number]: string } = {}

for (const key in NETWORKS) {
  if (NETWORKS[key].providerRpcUrl) {
    rpcs[key] = NETWORKS[key].providerRpcUrl as string
  }
}

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: rpcs,
    }),
  Object.keys(NETWORKS).map(c => Number(c))
);
