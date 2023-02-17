import Container from '@mui/material/Container';
import type { GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient } from 'react-query';

import { Grid, Skeleton } from '@mui/material';
import MainLayout from '../../../../src/components/layouts/main';

import { getAssetData, getAssetMetadata } from '../../../../src/services/nft';
import { getProviderBySlug } from '../../../../src/services/providers';

import { NextSeo } from 'next-seo';
import { FormattedMessage } from 'react-intl';
import { PageHeader } from '../../../../src/components/PageHeader';

import {
  GET_ASSET_DATA,
  GET_ASSET_METADATA,
  useAsset,
  useAssetMetadata,
} from '../../../../src/hooks/nft';
import AssetHead from '../../../../src/modules/nft/components/AssetHead';
import AssetLeftSection from '../../../../src/modules/nft/components/AssetLeftSection';
import AssetRightSection from '../../../../src/modules/nft/components/AssetRightSection';
import { getNetworkSlugFromChainId } from '../../../../src/utils/blockchain';
import { truncateErc1155TokenId } from '../../../../src/utils/nfts';

const AssetDetailPage: NextPage = () => {
  const router = useRouter();

  const { address, id } = router.query;

  const { data: asset } = useAsset(address as string, id as string);

  const { data: metadata } = useAssetMetadata(asset);

  return (
    <>
      <NextSeo
        title={`${metadata?.name}`}
        description={`${metadata?.description}`}
      />

      <AssetHead address={address as string} id={id as string} />
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PageHeader
              breadcrumbs={[
                {
                  caption: <FormattedMessage id="home" defaultMessage="Home" />,
                  uri: '/',
                },
                {
                  caption: asset?.collectionName ? (
                    asset?.collectionName
                  ) : (
                    <Skeleton />
                  ),
                  uri: `/collection/${getNetworkSlugFromChainId(
                    asset?.chainId
                  )}/${address}`,
                },
                {
                  caption: `${asset?.collectionName} #${truncateErc1155TokenId(
                    asset?.id
                  )}`,
                  uri: `/asset/${getNetworkSlugFromChainId(
                    asset?.chainId
                  )}/${address}/${id}`,
                  active: true,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AssetLeftSection address={address as string} id={id as string} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <AssetRightSection address={address as string} id={id as string} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params,
}: GetStaticPropsContext) => {
  if (params !== undefined) {
    const { address, id, network } = params;

    const queryClient = new QueryClient();

    const provider = getProviderBySlug(network as string);

    const asset = await getAssetData(provider, address as string, id as string);

    if (asset) {
      await queryClient.prefetchQuery(
        [GET_ASSET_DATA, address as string, id as string],
        async () => {
          return asset;
        }
      );

      if (asset?.tokenURI !== undefined) {
        const metadata = await getAssetMetadata(asset?.tokenURI, {
          image: '',
          name: `${asset.collectionName} #${asset.id}`,
        });

        await queryClient.prefetchQuery(
          [GET_ASSET_METADATA, asset?.tokenURI],
          async () => {
            return metadata;
          }
        );
      }
    }

    return {
      props: { dehydratedState: dehydrate(queryClient) },
      revalidate: 5,
    };
  }

  return {
    props: {},
  };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking', // false or 'blocking'
  };
}

(AssetDetailPage as any).getLayout = function getLayout(page: any) {
  return <MainLayout>{page}</MainLayout>;
};

export default AssetDetailPage;
