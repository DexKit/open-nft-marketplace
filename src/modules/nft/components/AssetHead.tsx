import { useAsset, useAssetMetadata } from '../../../hooks/nft';

import { NextSeo } from 'next-seo';

interface Props {
  address: string;
  id: string;
}

export function AssetHead({ address, id }: Props) {
  const { data: asset } = useAsset(address, id);

  const { data: metadata } = useAssetMetadata(asset);

  return (
    <NextSeo
      title={`${asset?.collectionName} - ${metadata?.name}`}
      description={metadata?.description}
    />
  );
}

export default AssetHead;
