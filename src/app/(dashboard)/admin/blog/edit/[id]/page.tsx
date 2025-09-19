'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import PostEditor from '@/app/components/PostEditor/PostEditor';
import { toast } from 'react-toastify';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const EditPostPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const headers = getAuthHeaders();
      if (!headers) { router.push('/login'); return; }
      try {
        const res = await axios.get(`${apiUrl}/api/admin/blog/posts/${params.id}`, { headers });
        console.log('Fetched post:', res.data);
        setPost(res.data);
      } catch {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id, router]);

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <PostEditor postToEdit={post} />
    </div>
  );
};

export default EditPostPage;
