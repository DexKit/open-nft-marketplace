import MultiCall, { CallInput } from '@indexed-finance/multicall';
import { Interface, isAddress } from 'ethers/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ERC20Abi } from '../../src/constants/abis';
import { getProviderByChainId } from '../../src/utils/blockchain';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chainId, address } = req.query;

  try {
    const contractAddress = address as string;

    if (chainId && isAddress(contractAddress)) {
      const provider = getProviderByChainId(parseInt(chainId as string));

      const iface = new Interface(ERC20Abi);

      const calls: CallInput[] = [];

      calls.push({
        interface: iface,
        target: contractAddress,
        function: 'name',
      });

      calls.push({
        interface: iface,
        target: contractAddress,
        function: 'symbol',
      });

      calls.push({
        interface: iface,
        target: contractAddress,
        function: 'decimals',
      });

      const multical = new MultiCall(provider);

      const [, results] = await multical.multiCall(calls);

      return res.json({
        name: results[0],
        symbol: results[1],
        decimals: results[2],
      });
    } else {
      return res.status(404).json({ error: 'chainId or address invalid' });
    }
  } catch (err) {
    return res.status(404).json({});
  }
}
