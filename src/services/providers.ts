import { providers } from 'ethers';
import { getChainIdFromName } from '../utils/blockchain';

export function getProviderBySlug(slug: string) {
  const network = getChainIdFromName(slug);

  if (network?.chainId !== undefined) {
    return new providers.JsonRpcProvider(network.providerRpcUrl);
  }
}
