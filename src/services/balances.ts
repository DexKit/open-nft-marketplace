import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
import { Contract, utils } from 'ethers';
import type { providers, BigNumber } from 'ethers';
import {
  MULTICALL_NATIVE_TOKEN_ADDRESS,
  ZEROEX_NATIVE_TOKEN_ADDRESS
} from '../constants';
import { ERC20Abi } from '../constants/abis';
import { ChainId } from '../constants/enum';
import { Token, TokenBalance } from '../types/blockchain';
import { getNativeCurrencySymbol } from '../utils/blockchain';
import {
  getMulticallTokenBalances,
  getMulticallTokenBalancesAndAllowances
} from './multical';

export const getERC20Decimals = async (
  contractAddress?: string,
  provider?: providers.BaseProvider
) => {
  if (contractAddress === undefined || provider === undefined) {
    return;
  }

  if (contractAddress === ZEROEX_NATIVE_TOKEN_ADDRESS) {
    return 18;
  }

  const contract = new Contract(contractAddress, ERC20Abi, provider);

  return await contract.decimals();
};

export const getERC20Symbol = async (
  contractAddress?: string,
  provider?: providers.BaseProvider
) => {
  if (contractAddress === undefined || provider === undefined) {
    return;
  }

  if (contractAddress === ZEROEX_NATIVE_TOKEN_ADDRESS) {
    return getNativeCurrencySymbol((await provider.getNetwork()).chainId);
  }

  const contract = new Contract(contractAddress, ERC20Abi, provider);

  return await contract.symbol();
};

export const getERC20Name = async (
  contractAddress?: string,
  provider?: providers.BaseProvider
) => {
  if (contractAddress === undefined || provider === undefined) {
    return;
  }

  const contract = new Contract(contractAddress, ERC20Abi, provider);

  return await contract.name();
};

export const getERC20Balance = async (
  contractAddress?: string,
  account?: string,
  provider?: providers.BaseProvider
) => {
  if (
    contractAddress === undefined ||
    account === undefined ||
    provider === undefined
  ) {
    return;
  }

  if (contractAddress === ZEROEX_NATIVE_TOKEN_ADDRESS) {
    return await provider.getBalance(account);
  }

  const contract = new Contract(contractAddress, ERC20Abi, provider);

  return await contract.balanceOf(account);
};

export const getERC20Balances = async (
  account: string,
  tokens: Token[],
  chainId: ChainId,
  provider: providers.JsonRpcProvider
) => {
  const tokensByChainId = tokens.filter((t) => t.chainId === chainId);

  // Add here native token address
  const tokenAddressesWithNative = [
    MULTICALL_NATIVE_TOKEN_ADDRESS,
    ...tokensByChainId
      .filter((t) => t.address.toLowerCase() !== ZEROEX_NATIVE_TOKEN_ADDRESS)
      .map((t) => t.address.toLowerCase()),
  ];

  const multicallBalanceResult = await getMulticallTokenBalances(
    tokenAddressesWithNative,
    account,
    provider
  );

  if (multicallBalanceResult) {
    const [, tokenBalances] = multicallBalanceResult;

    return tokensByChainId.map((t) => {
      let addr = t.address.toLowerCase();

      if (addr === ZEROEX_NATIVE_TOKEN_ADDRESS) {
        addr = MULTICALL_NATIVE_TOKEN_ADDRESS;
        // it's the native currency
      }

      return {
        token: t,
        balance: tokenBalances[addr],
      };
    }) as TokenBalance[];
  }

  return [];
};

export const getERC20WithProxyUnlockedBalances = async (
  account: string,
  tokens: Token[],
  chainId: ChainId,
  provider: providers.JsonRpcProvider
) => {
  const tokensByChainId = tokens.filter((t) => t.chainId === chainId);

  const zrxContracts = getContractAddressesForChainOrThrow(chainId as number);

  const exchangeProxy = zrxContracts.exchangeProxy;
  // Add here native token address
  const tokenAddressesWithNative = [
    MULTICALL_NATIVE_TOKEN_ADDRESS,
    ...tokensByChainId
      .filter((t) => t.address.toLowerCase() !== ZEROEX_NATIVE_TOKEN_ADDRESS)
      .map((t) => t.address.toLowerCase()),
  ];

  const multicallBalanceResult = await getMulticallTokenBalancesAndAllowances(
    tokenAddressesWithNative,
    account,
    exchangeProxy,
    provider
  );

  const balances: TokenBalance[] = [];

  if (multicallBalanceResult) {
    const [, tokenBalances] = multicallBalanceResult;

    const balances = tokensByChainId.map((t) => {
      let addr = t.address.toLowerCase();

      if (addr === ZEROEX_NATIVE_TOKEN_ADDRESS) {
        addr = MULTICALL_NATIVE_TOKEN_ADDRESS;
      }

      return {
        token: t,
        balance: tokenBalances[addr].balance,
        //@dev We are assuming it is unlocked, if it have more than 10*10**18 unlocked
        isProxyUnlocked:
          addr === MULTICALL_NATIVE_TOKEN_ADDRESS
            ? true
            : tokenBalances[addr].allowance.gt(utils.parseEther('10')),
      };
    }) as TokenBalance[];

    return balances;
  }

  return balances;
};

export const getERC20TokenAllowance = async (
  provider: providers.BaseProvider,
  tokenAddress: string,
  account: string,
  spender: string
): Promise<BigNumber> => {
  const contract = new Contract(tokenAddress, ERC20Abi, provider);

  return await contract.allowance(account, spender);
};
