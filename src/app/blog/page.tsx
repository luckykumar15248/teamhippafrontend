"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import SportsHeroSection from "../components/SportsHeroSection";

// --- Type Definitions ---
interface PostBrief {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl?: string;
  authorName: string;
  publishedAt: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- Reusable Post Card Component ---
const PostCard: React.FC<{ post: PostBrief }> = ({ post }) => (
  <Link
    href={`/blog/${post.slug}`}
    className="block group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden dark:shadow-gray-900 dark:hover:shadow-gray-800"
  >
    <div className="relative">
      <img
        src={
          post.featuredImageUrl ||
          "https://placehold.co/600x400/a7a2ff/333333?text=Blog"
        }
        alt={post.title}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold text-black dark:text-white line-clamp-1">
        {post.title}
      </h3>
      <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal line-clamp-2">
        {post.excerpt}
      </p>
      <div className="text-base text-gray-600 dark:text-gray-400 font-semibold mt-3">
        <span>By {post.authorName}</span> |{" "}
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>
    </div>
  </Link>
);

// --- Main Blog Page Component ---
const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<PostBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/public/blog/posts?page=${pageNum}&size=9`
      );
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch {
      toast.error("Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  return (
    <>
      <ToastContainer position="bottom-right" />
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Our Blog"
        description="News, tips, and insights from our team."
        showCallButton
      />
      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-white dark:bg-gray-900">
        <div className="space-y-16 max-w-screen-2xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Posts Found</h3>
              <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal">
                Check back soon for new articles!
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogPage;