export interface CampDto {
  campId: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  category: string;
  status: string;
  active: boolean;
  featuredImage?: MediaItemDto;
  mediaGallery: MediaItemDto[];
  sessions: CampSessionDto[];
  addonGroups: CampAddonGroupDto[];
  seoMetadata?: SeoMetadataDto;
}

export interface MediaItemDto {
  id: number;
  url: string;
  altText?: string;
  fileName?: string;
}

export interface CampSessionDto {
  sessionId: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  discountPrice?: number;
  maxCapacity: number;
  bookedSlots: number;
  status: string;
  campId?: number;
}

export interface CampAddonGroupDto {
  groupId: number;
  groupName: string;
  selectionType: string;
  displayOrder?: number;
  options: CampAddonOptionDto[];
}

export interface CampAddonOptionDto {
  optionId: number;
  optionName: string;
  priceAdjustment: number;
  displayOrder?: number;
}

export interface SeoMetadataDto {
  seoId?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  twitterCard?: string;
}