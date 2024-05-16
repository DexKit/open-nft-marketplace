import type { GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
import MainLayout from '../src/components/layouts/main';
import { FeaturedSection } from '../src/modules/home/components/FeaturedSection';

import { dehydrate, QueryClient } from 'react-query';
import {
  GET_ASSET_DATA,
  GET_ASSET_METADATA,
  GET_COLLECTION_DATA,
} from '../src/hooks/nft';
import VideoSection from '../src/modules/home/components/VideoSection';
import { getAppConfig } from '../src/services/app';
import {
  getAssetData,
  getAssetMetadata,
  getCollectionData,
} from '../src/services/nft';
import { AppConfig, AppPageSection } from '../src/types/config';
import { getNetworkSlugFromChainId } from '../src/utils/blockchain';

import ActionButtonsSection from '../src/modules/home/components/ActionButtonsSection';
import CallToActionSection from '../src/modules/home/components/CallToActionSection';
import CollectionsSection from '../src/modules/home/components/CollectionsSection';
import { getProviderBySlug } from '../src/services/providers';

const Home: NextPage<{ sections: AppPageSection[] }> = ({ sections }) => {
  const renderSections = () => {
    return sections.map((section, index: number) => {
      if (section.type === 'featured') {
        return (
          <FeaturedSection
            title={section.title}
            items={section.items}
            key={index}
          />
        );
      } else if (section.type === 'video') {
        return (
          <VideoSection
            embedType={section.embedType}
            videoUrl={section.videoUrl}
            title={section.title}
            key={index}
          />
        );
      } else if (section.type === 'call-to-action') {
        return <CallToActionSection section={section} key={index} />;
      } else if (section.type === 'collections') {
        return <CollectionsSection key={index} section={section} />;
      }
    });
  };

  return (
    <MainLayout disablePadding>
      {renderSections()}
      {<ActionButtonsSection />}
    </MainLayout>
  );
};

export const getStaticProps: GetStaticProps =
  async ({}: GetStaticPropsContext) => {
    const queryClient = new QueryClient();
    const config: AppConfig = getAppConfig();

    const homePage = config.pages.home;
    /* Disabling prefilling data 
    
    const queryClient = new QueryClient();

    const config: AppConfig = getAppConfig();

    const homePage = config.pages.home;

    for (let section of homePage.sections) {
      if (
        section.type === 'featured' ||
        section.type === 'call-to-action' ||
        section.type === 'collections'
      ) {
        for (let item of section.items) {
          if (item.type === 'asset' && item.tokenId !== undefined) {
            const slug = getNetworkSlugFromChainId(item.chainId);

            if (slug === undefined) {
              continue;
            }

            const provider = getProviderBySlug(slug);

            await provider?.ready;

            const asset = await getAssetData(
              provider,
              item.contractAddress,
              item.tokenId
            );

            if (asset) {
              await queryClient.prefetchQuery(
                [GET_ASSET_DATA, item.contractAddress, item.tokenId],
                async () => asset
              );

              const metadata = await getAssetMetadata(asset.tokenURI, {
                image: '',
                name: `${asset.collectionName} #${asset.id}`,
              });

              await queryClient.prefetchQuery(
                [GET_ASSET_METADATA, asset.tokenURI],
                async () => {
                  return metadata;
                }
              );
            }
          } else if (item.type === 'collection') {
            const slug = getNetworkSlugFromChainId(item.chainId);

            if (slug === undefined) {
              continue;
            }

            const provider = getProviderBySlug(slug);

            await provider?.ready;

            const collection = await getCollectionData(
              provider,
              item.contractAddress
            );

            await queryClient.prefetchQuery(
              [GET_COLLECTION_DATA, item.contractAddress, item.chainId],
              async () => collection
            );
          }
        }
      }
    }*/

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        sections: homePage.sections,
      },
    };
  };

export default Home;
