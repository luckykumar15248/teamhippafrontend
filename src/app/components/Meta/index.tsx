import Head from "next/head";

interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string; 
   canonical?: string;
  ogType?: string; 
  twitterCard?: string;
  keywords?: string;
 // e.g., "website", "article"
}

const Meta = ({ title, description, image, url }: MetaProps) => {
  const siteUrl = url || "https://teamhippa.com";
  const siteImage = image || "/images/og-default.jpg";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

       {/* Open Graph / Facebook  */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={siteImage} />
    </Head>
  );
};

export default Meta;
