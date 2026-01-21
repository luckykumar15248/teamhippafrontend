import { MetadataRoute } from 'next';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';

interface SitemapUrl {
    loc: string;
    lastmod: string; // The date should be in ISO 8601 format
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    // Fetch dynamic URLs from your backend
    const fetchUrls = async (path: string): Promise<SitemapUrl[]> => {
        try {
            const response = await axios.get(`${apiUrl}${path}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch sitemap URLs from ${path}:`, error);
            return [];
        }
    };

    const blogUrls = await fetchUrls('/api/public/blog/sitemap-urls');
    const courseUrls = await fetchUrls('/api/public_api/courses/sitemap-urls');
    const packageUrls = await fetchUrls('/api/public/packages/sitemap-urls');
    const campUrls = await fetchUrls('/api/public/camps/sitemap-urls');

    // Format the dynamic URLs
    const formattedBlogUrls = blogUrls.map(item => ({
        url: `${siteUrl}/blog/${item.loc}`,
        lastModified: new Date(item.lastmod).toISOString(),
    }));

    const formattedCourseUrls = courseUrls.map(item => ({
        url: `${siteUrl}/book-now/courses/${item.loc}`,
        lastModified: new Date(item.lastmod).toISOString(),
    }));

    const formattedPackageUrls = packageUrls.map(item => ({
        url: `${siteUrl}/packages/${item.loc}`,
        lastModified: new Date(item.lastmod).toISOString(),
    }));

    const formattedCampUrls = campUrls.map(item => ({
        url: `${siteUrl}/camps/${item.loc}`,
        lastModified: new Date(item.lastmod).toISOString(),
    }));

    // Add your static pages
    const staticUrls = [
        { url: siteUrl, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/about`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/contact`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/book-now`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/terms-of-service`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/privacy-policy`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/gallery`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/summer-camp`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/winter-camp`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/tennis-phoenix`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/tennis-gilbert`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/sports/pickleball`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/sports/tennis`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/phoenix-junior-tennis`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/gilbert-adult-tennis-clinics`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/pickleball-gilbert`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/private-tennis-coaching-in-phoenix-and-gilbert`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/blog`, lastModified: new Date().toISOString() },
        { url: `${siteUrl}/camps`, lastModified: new Date().toISOString() }
    ];
    
    // Combine all URLs
    return [
        ...staticUrls,
        ...formattedBlogUrls,
        ...formattedCourseUrls,
        ...formattedPackageUrls,
        ...formattedCampUrls
    ];
}