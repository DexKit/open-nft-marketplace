import { MultiCall } from '@indexed-finance/multicall';
import { ethers } from 'ethers';

export const getMulticallFromProvider = async (
  provider?: ethers.providers.JsonRpcProvider
) => {
  if (provider !== undefined) {
    return new MultiCall(provider);
  }
};

export const getMulticallTokenBalances = async (
  tokens: string[],
  account: string,
  provider: ethers.providers.JsonRpcProvider
) => {
  const multicall = await getMulticallFromProvider(provider);
  const tokensBal = await multicall?.getBalances(tokens, account);
  return tokensBal;
};

export const getMulticallTokenBalancesAndAllowances = async (
  tokens: string[],
  account: string,
  target: string,
  provider: ethers.providers.JsonRpcProvider
) => {
  const multicall = await getMulticallFromProvider(provider);
  const tokensBalAll = await multicall?.getBalancesAndAllowances(
    tokens,
    account,
    target
  );
  return tokensBalAll;
};
