import { TraderOrderStatus } from '../constants/enum';

export interface TraderOrderFilter {
  nftToken?: string;
  nftTokenId?: string;
  erc20Token?: string;
  chainId?: number;
  maker?: string;
  taker?: string;
  nonce?: string;
  sellOrBuyNft?: string; // TODO: COLOCAR ENUM
  status?: TraderOrderStatus;
  visibility?: string;
  offset?: number;
  limit?: number;
}
