// This interface defines a single image from your 'media_library' table
export interface MediaItem {
  id: number;
  url: string;        // The main URL to display the image
  mediaUrl?: string;  // A backup property in case your API uses this name
  originalUrl?: string; // A backup property in case your API uses this name
  altText?: string;
  fileName: string;
}

// This interface defines all the SEO data
export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
}