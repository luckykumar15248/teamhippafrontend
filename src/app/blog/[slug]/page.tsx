import React from 'react';
import axios from 'axios';
import { Metadata } from 'next';

// --- Type Definitions ---
interface PostDetail {
    id: number;
    title: string;
    slug: string;
    content: any; // Editor.js JSON or string
    excerpt: string;
    featuredImageUrl?: string;
    authorName: string;
    publishedAt: string;
    categories: { name: string; slug: string }[];
    tags: { name: string; slug: string }[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- SEO Metadata Generation (Server-Side) ---
export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    try {
        const response = await axios.get(
            `${apiUrl}/api/public/blog/posts/${params.slug}`
        );
        const post: PostDetail = response.data;
        return {
            title: post.title,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                images: [post.featuredImageUrl || ''],
            },
        };
    } catch (error) {
        return {
            title: 'Post Not Found',
            description: 'This blog post could not be found.',
        };
    }
}

// --- Helper to Render Editor.js Blocks ---
const renderBlockContent = (contentObject: any) => {
    let parsedContent = contentObject;

    // If API returned a string, parse it
    if (typeof contentObject === 'string') {
        try {
            parsedContent = JSON.parse(contentObject);
        } catch (e) {
            console.error('Failed to parse content JSON:', e);
            return (
                <div className="prose lg:prose-xl max-w-none">
                    {contentObject}
                </div>
            );
        }
    }

    // Ensure blocks exist
    if (
        !parsedContent ||
        !parsedContent.blocks ||
        !Array.isArray(parsedContent.blocks)
    ) {
        return (
            <div className="prose lg:prose-xl max-w-none">
                {String(parsedContent)}
            </div>
        );
    }

    return parsedContent.blocks.map((block: any, index: number) => {
        switch (block.type) {
            case 'header':
                return React.createElement(`h${block.data.level || 2}`, {
                    key: index,
                    className: 'font-bold my-4 text-2xl',
                    dangerouslySetInnerHTML: { __html: block.data.text },
                });
            case 'paragraph':
                return (
                    <p
                        key={index}
                        className="mb-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                );
            case 'image':
                return (
                    <figure key={index} className="my-6">
                        <img
                            src={block.data.file?.url}
                            alt={block.data.caption || 'Blog image'}
                            className="w-full rounded-lg shadow-md"
                        />
                        {block.data.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {block.data.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case 'list':
                const ListTag =
                    block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag
                        key={index}
                        className="list-inside list-disc pl-5 mb-4"
                    >
                        {block.data.items.map((item: string, i: number) => (
                            <li
                                key={i}
                                dangerouslySetInnerHTML={{ __html: item }}
                            />
                        ))}
                    </ListTag>
                );
            default:
                return null;
        }
    });
};

// --- Main Post Page Component ---
const PostPage = async ({ params }: { params: { slug: string } }) => {
    try {
        const response = await axios.get(
            `${apiUrl}/api/public/blog/posts/${params.slug}`
        );
        const post: PostDetail = response.data;

        return (
            <article className="bg-white">
                {post.featuredImageUrl && (
                    <header className="relative h-96">
                        <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-opacity-50 flex flex-col justify-center items-center text-center p-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white">
                                {post.title}
                            </h1>
                            <p className="mt-4 text-lg text-gray-300">
                                By {post.authorName} on{' '}
                                {new Date(post.publishedAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }
                                )}
                            </p>
                        </div>
                    </header>
                )}

                <div className="container mx-auto max-w-4xl py-12 px-4">
                    <div className="prose lg:prose-xl max-w-none">
                        {renderBlockContent(post.content)}
                    </div>

                    <div className="mt-16 border-t pt-8">
                        <h3 className="text-2xl font-bold">Comments</h3>
                        <p className="text-gray-600 mt-2">
                            Comments are coming soon!
                        </p>
                    </div>
                </div>
            </article>
        );
    } catch (error) {
        return (
            <div className="text-center py-20">
                <h1 className="text-4xl font-bold">Post Not Found</h1>
                <p className="mt-4 text-gray-600">
                    Sorry, we couldn&apos;t find the post you were looking for.
                </p>
            </div>
        );
    }
};

export default PostPage;
