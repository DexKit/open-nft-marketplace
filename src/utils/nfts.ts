import { UserFacingFeeStruct } from '@traderxyz/nft-swap-sdk';
import { ethers } from 'ethers';
import { ChainId } from '../constants/enum';

export function calculeFees(
  amount: ethers.BigNumber,
  decimals: number,
  fees: { amount_percentage: number; recipient: string }[]
): UserFacingFeeStruct[] {
  let tempFees: UserFacingFeeStruct[] = [];

  for (let fee of fees) {
    tempFees.push({
      amount: amount
        .mul((fee.amount_percentage * 100).toFixed(0))
        .div(10000)
        .toString(),
      recipient: fee.recipient,
    });
  }

  return tempFees;
}

export function truncateErc1155TokenId(id?: string) {
  if (id === undefined) {
    return '';
  }

  return `${id.substring(0, 12)}...`;
}

export function getNFTMediaSrcAndType(address: string, chainId: ChainId, tokenId: string): { type: 'iframe' | 'image', src?: string } {

  if (address.toLowerCase() === '0x5428dff180837ce215c8abe2054e048da311b751' && chainId === ChainId.Polygon) {
    return { type: 'iframe', src: `https://arpeggi.io/player?type=song&token=${tokenId}` }
  }

  return { type: 'image' }


}
