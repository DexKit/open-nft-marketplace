import axios from 'axios';

export async function getTokenData(chainId: number, address: string) {
  const response = await axios.get<{
    decimals: number;
    name: string;
    symbol: string;
  }>('/api/token', { params: { chainId, address } });

  return response.data;
}
