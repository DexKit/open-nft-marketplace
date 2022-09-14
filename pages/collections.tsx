import { Container, Grid } from '@mui/material';
import type { GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { FormattedMessage, useIntl } from 'react-intl';
import { dehydrate, QueryClient } from 'react-query';
import collectionListJson from '../config/default.collectionlist.json';
import MainLayout from '../src/components/layouts/main';
import { PageHeader } from '../src/components/PageHeader';
import { GET_COLLECTION_DATA } from '../src/hooks/nft';
import CollectionCardWithData from '../src/modules/home/components/CollectionCardWithData';
import { getAppConfig } from '../src/services/app';
import { getCollectionData } from '../src/services/nft';
import { getProviderByChainId } from '../src/utils/blockchain';

const appConfig = getAppConfig();

const Collections: NextPage = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <NextSeo
        title={formatMessage({
          id: 'collections',
          defaultMessage: 'Collections',
        })}
      />
      <MainLayout>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PageHeader
                breadcrumbs={[
                  {
                    caption: (
                      <FormattedMessage id="home" defaultMessage="Home" />
                    ),
                    uri: '/',
                  },
                  {
                    caption: (
                      <FormattedMessage
                        id="collections"
                        defaultMessage="Collections"
                      />
                    ),
                    uri: '/collections',
                    active: true,
                  },
                ]}
              />
            </Grid>
            {appConfig.collections?.map((collection, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <CollectionCardWithData
                  chainId={collection.chainId}
                  contractAddress={collection.contractAddress}
                  backgroundImageUrl={collection.backgroundImage}
                  variant="simple"
                  title={collection.name}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </MainLayout>
    </>
  );
};

export default Collections;

export const getStaticProps: GetStaticProps =
  async ({}: GetStaticPropsContext) => {
    const queryClient = new QueryClient();

    for (let collection of collectionListJson.collections) {
      const provider = getProviderByChainId(collection.chainId);

      await provider?.ready;

      if (provider) {
        const data = await getCollectionData(
          provider,
          collection.contractAddress
        );

        await queryClient.prefetchQuery(
          [GET_COLLECTION_DATA, collection.contractAddress, collection.chainId],
          async () => data
        );
      }
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  };
