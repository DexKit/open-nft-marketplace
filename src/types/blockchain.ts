import { SwappableAssetV4 } from '@traderxyz/nft-swap-sdk';
import { BigNumber } from 'ethers';
import { ChainId } from '../constants/enum';
import { Asset, SwapApiOrder } from './nft';

export enum TransactionStatus {
  Pending,
  Failed,
  Confirmed,
}

export enum TransactionType {
  APPROVE,
  APPROVAL_FOR_ALL,
  WRAP,
  BUY,
  ACCEPT,
  CANCEL,
  MAKE_OFFER,
  SWAP,
}

export interface SwapTransactionMetadata {
  sellToken: Token;
  buyToken: Token;
  sellAmount: BigNumber;
  buyAmount: BigNumber;
}

export interface ApproveTransactionMetadata {
  amount: string;
  symbol: string;
  name?: string;
  decimals: string;
}

export interface ApproveForAllTransactionMetadata {
  asset: Asset;
}

export interface CancelTransactionMetadata {
  asset: Asset;
  order: SwapApiOrder;
}

export interface AcceptTransactionMetadata {
  asset: Asset;
  order: SwapApiOrder;
  tokenDecimals: number;
  symbol: string;
}

export interface BuyTransactionMetadata {
  asset: Asset;
  order: SwapApiOrder;
  tokenDecimals: number;
  symbol: string;
}

export type TransactionMetadata =
  | SwapTransactionMetadata
  | ApproveTransactionMetadata
  | CancelTransactionMetadata
  | AcceptTransactionMetadata
  | BuyTransactionMetadata
  | ApproveForAllTransactionMetadata;

export interface Transaction {
  title?: string;
  status: TransactionStatus;
  type: TransactionType;
  created: number;
  chainId: number;
  checkedBlockNumber?: number;
  metadata?: TransactionMetadata;
  checked?: boolean;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: ChainId;
  logoURI: string;
}

export interface TokenBalance {
  token: Token;
  balance: BigNumber;
  isProxyUnlocked?: boolean;
}

export interface Quote {
  allowanceTarget: string;
  buyAmount: string;
  buyTokenAddress: string;
  buyTokenToEthRate: string;
  chainId: number;
  data: string;
  estimatedGas: string;
  estimatedPriceImpact: string;
  gas: string;
  gasPrice: string;
  guaranteedPrice: string;
  minimumProtocolFee: string;
  price: string;
  protocolFee: string;
  sellAmount: string;
  sellTokenAddress: string;
  sellTokenToEthRate: string;
  sources: { name: string; proportion: string }[];
  to: string;
  value: string;
}
