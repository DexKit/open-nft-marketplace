import { useFullAsset } from '../../../hooks/nft';
import { AssetCard } from './AssetCard';

interface Props {
  address: string;
  id: string;
}

export function AssetCardWithData({ address, id }: Props) {
  const asset = useFullAsset({ address, id });

  return <AssetCard asset={asset} />;
}
