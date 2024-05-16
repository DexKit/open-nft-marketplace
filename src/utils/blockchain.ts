import { ChainId } from '../constants/enum';

import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

import metaMaskImage from '../../public/assets/images/metamask-fox.svg';
import walletConnectImage from '../../public/assets/images/walletconnect-circle-blue.svg';

import { Connector } from '@web3-react/types';
import { utils, providers } from 'ethers';
import { NETWORKS } from '../constants/chain';

export const getChainIdFromName = (chainName: string) => {
  const keys = Object.keys(NETWORKS).map(Number);

  let key = keys.find((key) => NETWORKS[key].slug === chainName);

  if (key !== undefined) {
    return NETWORKS[key];
  }

  return undefined;
};

export const getNetworkSlugFromChainId = (chainId?: ChainId) => {
  if (chainId) {
    return NETWORKS[chainId].slug;
  }
};

export const getProviderByChainId = (chainId?: ChainId) => {
  if (chainId) {
    if (NETWORKS[chainId].providerRpcUrl) {
      return new providers.JsonRpcProvider(
        NETWORKS[chainId].providerRpcUrl
      );
    }
  }
};

export const truncateAddress = (address: string | undefined) => {
  if (address !== undefined && utils.isAddress(address)) {
    return `${address.slice(0, 7)}...${address.slice(address.length - 5)}`;
  }
  return '';
};

export function getName(connector: any) {
  if (connector instanceof MetaMask) return 'MetaMask';
  if (connector instanceof WalletConnect) return 'WalletConnect';
  return 'Unknown';
}

export function getWalletIcon(connector: any) {
  if (connector instanceof MetaMask) return metaMaskImage.src;
  if (connector instanceof WalletConnect) return walletConnectImage.src;
  return undefined;
}

export function isAddressEqual(address?: string, other?: string) {
  if (address === undefined || other === undefined) {
    return false;
  }

  if (!utils.isAddress(address) || !utils.isAddress(other)) {
    return false;
  }

  return address.toLowerCase() === other.toLowerCase();
}

export function getBlockExplorerUrl(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId].explorerUrl;
  }
}

export function getNativeCurrencySymbol(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId]?.nativeCurrency?.symbol || NETWORKS[chainId]?.symbol;
  }
}

export function getChainName(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId]?.name;
  }
}

export function getNativeCurrencyName(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId]?.nativeCurrency?.name || NETWORKS[chainId]?.name;
  }
}

export function getChainLogoImage(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId]?.imageUrl;
  }
}

export function getNativeCurrencyImage(chainId?: number) {
  if (chainId) {
    return NETWORKS[chainId]?.nativeCurrencyUrl || NETWORKS[chainId]?.imageUrl;
  }
}

export async function switchNetwork(connector: Connector, chainId: number) {
  if (connector instanceof MetaMask) {
    if (chainId === ChainId.Arbitrum) {
      return connector.provider?.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId:
            `0x${chainId.toString(16)}`,
          chainName: NETWORKS[ChainId.Arbitrum].name,
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [NETWORKS[ChainId.Arbitrum].providerRpcUrl],
          blockExplorerUrls: [NETWORKS[ChainId.Arbitrum].explorerUrl],
        }],
      });
    }

    return connector.provider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  }
}
