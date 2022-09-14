import { useCollection } from '../../../hooks/nft';
import CollectionCard from './CollectionCard';

interface Props {
  contractAddress?: string;
  chainId: number;
  title?: string;
  backgroundImageUrl?: string;
  variant?: 'default' | 'simple';
}

export function CollectionCardWithData({
  contractAddress,
  chainId,
  title,
  backgroundImageUrl,
  variant,
}: Props) {
  const { data: collection } = useCollection(contractAddress, chainId);

  return (
    <CollectionCard
      variant={variant}
      totalSupply={3}
      collection={collection}
      title={title}
      backgroundImageUrl={backgroundImageUrl}
    />
  );
}

export default CollectionCardWithData;
