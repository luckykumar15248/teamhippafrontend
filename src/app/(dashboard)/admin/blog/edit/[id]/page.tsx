'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import PostEditor from '@/app/components/PostEditor/PostEditor';
import { toast } from 'react-toastify';

// Define interfaces for the post data - matching PostEditor's expected interface
interface Category { id: number; name: string; slug: string; parentId?: number | null; children?: Category[]; }
interface Tag { id: number; name: string; slug: string; }
interface MediaItem { id: number; mediaUrl: string; altText?: string; fileName?: string; }
interface Expert { id: number; name: string; title: string; bio: string; image: string; }

interface SEOData {
  metaTitle?: string;
  metaTitleSuffix?: string;
  metaDescription?: string;
  serpPreviewText?: string;
  metaKeywords?: string;
  metaRobots?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: number | null;
  ogImageAlt?: string | null;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageId?: number | null;
  twitterImageAlt?: string | null;
  structuredData?: Record<string, unknown>;
  customMetaTags?: Record<string, string>;
}

// Based on the error, PostEditor expects content to be string | OutputData
// If you have access to the OutputData type from PostEditor, import it
// Otherwise, we'll use a union type that matches the expected types
interface Post {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  content: string; // Changed to match PostEditor's expected type
  categories?: Category[];
  tags?: Tag[];
  experts?: Expert[];
  featuredImage?: MediaItem | null;
  seoMetadata?: SEOData;
  ogImage?: MediaItem | null;
  twitterImage?: MediaItem | null;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const EditPostPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const headers = getAuthHeaders();
      if (!headers) { router.push('/login'); return; }
      try {
        const res = await axios.get(`${apiUrl}/api/admin/blog/posts/${params.id}`, { headers });
        console.log('Fetched post:', res.data);
        
        // Transform the content to match PostEditor's expected type
        const postData = res.data;
        if (postData.content && typeof postData.content !== 'string') {
          // Convert object content to string if needed, or handle appropriately
          postData.content = JSON.stringify(postData.content);
        }
        
        setPost(postData);
      } catch {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id, router]);

  if (isLoading) return <div className="p-6 flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Post</h1>
          <p className="text-gray-600">Make changes to your post content, SEO settings, and more.</p>
        </div>
        <PostEditor postToEdit={post} />
      </div>
    </div>
  );
};

export default EditPostPage;