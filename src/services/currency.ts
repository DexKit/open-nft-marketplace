import axios from 'axios';
import { COINGECKO_ENDPOIT, COINGECKO_PLATFORM_ID } from '../constants';
import { ChainId } from '../constants/enum';

export const getTokenPrices = async ({
  chainId,
  addresses,
  currency = 'usd',
}: {
  chainId: ChainId;
  addresses: string[];
  currency: string;
}): Promise<{ [key: string]: { [key: string]: number } }> => {
  const platformId = COINGECKO_PLATFORM_ID[chainId];
  if (!platformId) {
    return {};
  }

  const priceResponce = await axios.get(
    `${COINGECKO_ENDPOIT}/simple/token_price/${platformId}?contract_addresses=${addresses.concat(
      ','
    )}&vs_currencies=${currency}`
  );

  return priceResponce.data as { [key: string]: { [key: string]: number } };
};

export const getCoinPrices = async ({
  coingeckoIds,
  currency = 'usd',
}: {
  coingeckoIds: string[];
  currency: string;
}): Promise<{ [key: string]: { [key: string]: number } }> => {
  const priceResponce = await axios.get(
    `${COINGECKO_ENDPOIT}/simple/price?ids=${coingeckoIds.concat(
      ','
    )}&vs_currencies=${currency}`
  );

  return priceResponce.data as { [key: string]: { [key: string]: number } };
};
