import React from "react";
import axios from "axios";
import { Metadata } from "next";

// --- Type Definitions ---
interface Category {
  name: string;
  slug: string;
}

interface Tag {
  name: string;
  slug: string;
}

// Editor.js Block Types
interface HeaderBlock {
  type: "header";
  data: { text: string; level?: number };
}

interface ParagraphBlock {
  type: "paragraph";
  data: { text: string };
}

interface ImageBlock {
  type: "image";
  data: { file?: { url: string }; caption?: string };
}

interface ListBlock {
  type: "list";
  data: { style: "ordered" | "unordered"; items: string[] };
}

type EditorBlock = HeaderBlock | ParagraphBlock | ImageBlock | ListBlock;

interface EditorContent {
  time?: number;
  version?: string;
  blocks: EditorBlock[];
}

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  content: EditorContent | string; // no more `any`
  excerpt: string;
  featuredImageUrl?: string;
  authorName: string;
  publishedAt: string;
  categories: Category[];
  tags: Tag[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- SEO Metadata Generation (Server-Side) ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const response = await axios.get<PostDetail>(
      `${apiUrl}/api/public/blog/posts/${params.slug}`
    );
    const post = response.data;
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [post.featuredImageUrl || ""],
      },
    };
  } catch {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found.",
    };
  }
}

// --- Helper to Render Editor.js Blocks ---
const renderBlockContent = (contentObject: EditorContent | string) => {
  let parsedContent: EditorContent | null = null;

  if (typeof contentObject === "string") {
    try {
      parsedContent = JSON.parse(contentObject) as EditorContent;
    } catch (e) {
      console.error("Failed to parse content JSON:", e);
      return (
        <div className="prose lg:prose-xl max-w-none">{contentObject}</div>
      );
    }
  } else {
    parsedContent = contentObject;
  }

  if (!parsedContent?.blocks || !Array.isArray(parsedContent.blocks)) {
    return (
      <div className="prose lg:prose-xl max-w-none">
        {String(contentObject)}
      </div>
    );
  }

  return parsedContent.blocks.map((block, index) => {
    switch (block.type) {
      case "header":
        return React.createElement(`h${block.data.level || 2}`, {
          key: index,
          className: "font-bold my-4 text-2xl",
          dangerouslySetInnerHTML: { __html: block.data.text },
        });

      case "paragraph":
        return (
          <p
            key={index}
            className="mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      case "image":
        return (
          <figure key={index} className="my-6">
            <img
              src={block.data.file?.url}
              alt={block.data.caption || "Blog image"}
              className="w-full rounded-lg shadow-md"
            />
            {block.data.caption && (
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case "list":
        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={index} className="list-inside list-disc pl-5 mb-4">
            {block.data.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
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
    const response = await axios.get<PostDetail>(
      `${apiUrl}/api/public/blog/posts/${params.slug}`
    );
    const post = response.data;

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
                By {post.authorName} on{" "}
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </header>
        )}

        <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="space-y-16 max-w-screen-lg mx-auto">
           <div className="custome-post">
            {renderBlockContent(post.content)}
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="text-3xl font-bold text-gray-900">Comments</h3>
            <p className="text-base sm:text-lg text-gray-600 font-normal mt-1">Comments are coming soon!</p>
          </div>
           </div>
        </section>
      </article>
    );
  } catch {
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
