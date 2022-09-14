import { ethers } from 'ethers';
import { getChainIdFromName } from '../utils/blockchain';

export function getProviderBySlug(slug: string) {
  const network = getChainIdFromName(slug);

  if (network?.chainId !== undefined) {
    return new ethers.providers.JsonRpcProvider(network.providerRpcUrl);
  }
}
