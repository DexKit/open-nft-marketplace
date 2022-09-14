export type VideoEmbedType = 'youtube' | 'vimeo';

export type SocialMediaTypes = 'instagram' | 'facebook' | 'twitter';

export interface AssetItemType {
  type: 'asset';
  title: string;
  chainId: number;
  contractAddress: string;
  tokenId: string;
}

export interface CollectionItemType {
  type: 'collection';
  variant?: 'default' | 'simple';
  featured?: boolean;
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
  chainId: number;
  contractAddress: string;
}

export type SectionItem = AssetItemType | CollectionItemType;

export type PageSectionVariant = 'dark' | 'light';

export interface PageSection {
  variant?: PageSectionVariant;
}

export interface CallToActionAppPageSection extends PageSection {
  type: 'call-to-action';
  title: string;
  subtitle: string;
  button: {
    title: string;
    url: string;
  };
  items: SectionItem[];
}

export interface VideoEmbedAppPageSection extends PageSection {
  type: 'video';
  title: string;
  embedType: VideoEmbedType;
  videoUrl: string;
}

export interface FeaturedAppPageSection extends PageSection {
  type: 'featured';
  title: string;
  items: SectionItem[];
}

export interface CollectionAppPageSection extends PageSection {
  type: 'collections';
  title: string;
  items: SectionItem[];
}

export type AppPageSection =
  | CallToActionAppPageSection
  | VideoEmbedAppPageSection
  | FeaturedAppPageSection
  | CollectionAppPageSection;

export interface AppPage {
  sections: AppPageSection[];
}

export interface SocialMedia {
  type: SocialMediaTypes;
  handle: string;
}


export interface AppCollection {
  image: string;
  name: string;
  backgroundImage: string;
  chainId: number;
  contractAddress: string;
  description: string;
  uri: string;
}

export interface AppConfig {
  name: string;
  locale?: string;
  theme: string;
  url: 'http://localhost:3001';
  logo?: {
    width?: string;
    height?: string;
    url: string;
  };
  favicon_url?: string;
  social?: SocialMedia[];
  pages: { [key: string]: AppPage };
  transak?: { enabled: boolean };
  fees?: {
    amount_percentage: number;
    recipient: string;
  }[];
  format: {
    date: string;
    datetime: string;
  };
  collections?: AppCollection[];
  seo?: {
    home?: {
      title: string,
      description: string,
    }
  }

}
