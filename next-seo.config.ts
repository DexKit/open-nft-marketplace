import { getAppConfig } from './src/services/app';

const config = getAppConfig();

const seoConfig: any = {
  defaultTitle: config.seo?.home?.title || config.name,
  titleTemplate: `${config.name} | %s`,
  description: config.seo?.home?.description,
  canonical: config.url,
};

if (config.social) {
  for (let social of config.social) {
    if (social.type === 'twitter') {
      seoConfig.twitter = {
        handle: `@${social.handle}`,
        site: `@${social.handle}`,
        cardType: "summary_large_image"
      };
    }
  }
}

export default seoConfig;
