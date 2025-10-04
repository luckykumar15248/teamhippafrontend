import React from "react";
import type { JSX } from "react";
import axios from "axios";
import { Metadata } from "next";
import { Check } from "lucide-react";

interface Category {
  name: string;
  slug: string;
}

interface Tag {
  name: string;
  slug: string;
}

// --- Editor.js Block Interfaces ---
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
  data: {
    style: "ordered" | "unordered";
    items: (string | { content?: string; text?: string; meta?: object })[];
  };
}

interface ChecklistBlock {
  type: "checklist";
  data: { items: { text: string; checked: boolean }[] };
}

interface QuoteBlock {
  type: "quote";
  data: { text: string; caption: string };
}

interface TableBlock {
  type: "table";
  data: { content: string[][] };
}

interface CodeBlock {
  type: "code";
  data: { code: string };
}

interface LinkBlock {
  type: "linkTool";
  data: { link: string; meta?: { title?: string; description?: string; image?: { url: string } } };
}

interface DelimiterBlock {
  type: "delimiter";
  data: object;
}

type EditorBlock =
  | HeaderBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock
  | ChecklistBlock
  | QuoteBlock
  | TableBlock
  | CodeBlock
  | LinkBlock
  | DelimiterBlock;

interface EditorContent {
  time?: number;
  version?: string;
  blocks: EditorBlock[];
}

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  content: EditorContent | string;
  excerpt: string;
  featuredImageUrl?: string;
  authorName: string;
  publishedAt: string;
  categories: Category[];
  tags: Tag[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const dynamic = "force-dynamic";

// --- SEO Metadata ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await axios.get<PostDetail>(
      `${apiUrl}/api/public/blog/posts/${slug}`,
      { headers: { "Cache-Control": "no-cache" } }
    );
    const post = response.data;
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
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
    } catch {
      return <div className="prose lg:prose-xl max-w-none">{contentObject}</div>;
    }
  } else parsedContent = contentObject;

  if (!parsedContent?.blocks) return null;

  return parsedContent.blocks.map((block, index) => {
    switch (block.type) {
      // --- Heading ---
      case "header":
        const Tag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <Tag
            key={index}
            className="font-bold my-4 text-2xl"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      // --- Paragraph ---
      case "paragraph":
        return (
          <p
            key={index}
            className="mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );

      // --- Image ---
      case "image":
        return (
          <figure key={index} className="my-6">
            <img
              src={block.data.file?.url}
              alt={block.data.caption || "Image"}
              className="w-full rounded-lg shadow-md"
            />
            {block.data.caption && (
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      // --- List (ordered / unordered) ---
      case "list":
        const isOrdered = block.data.style === "ordered";
        const ListTag = isOrdered ? "ol" : "ul";
        return (
          <ListTag
            key={index}
            className={`${
              isOrdered ? "list-decimal" : "list-disc"
            } pl-6 space-y-1 mb-4`}
          >
            {block.data.items.map((item, i) => {
              const text =
                typeof item === "string"
                  ? item
                  : item?.content || item?.text || JSON.stringify(item);
              return (
                <li key={i} dangerouslySetInnerHTML={{ __html: text }}></li>
              );
            })}
          </ListTag>
        );

      // --- Checklist ---
      case "checklist":
        return (
          <ul key={index} className="space-y-2 mb-4">
            {block.data.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                {item.checked ? (
                  <Check className="text-green-600 w-5 h-5 mt-1" />
                ) : (
                  <div className="w-5 h-5 border rounded mt-1" />
                )}
                <span
                  dangerouslySetInnerHTML={{ __html: item.text }}
                  className={item.checked ? "line-through text-gray-500" : ""}
                />
              </li>
            ))}
          </ul>
        );

      // --- Quote ---
      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-gray-400 pl-4 italic my-4 text-gray-700"
          >
            <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && (
              <cite className="block mt-2 text-sm text-gray-500">
                — {block.data.caption}
              </cite>
            )}
          </blockquote>
        );

      // --- Table ---
      case "table":
        return (
          <table
            key={index}
            className="w-full border border-gray-300 my-6 border-collapse"
          >
            <tbody>
              {block.data.content.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-gray-300 p-2"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      // --- Code Block ---
      case "code":
        return (
          <pre
            key={index}
            className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto my-4"
          >
            <code>{block.data.code}</code>
          </pre>
        );

      // --- Link Tool ---
      case "linkTool":
        return (
          <div key={index} className="my-6 border rounded-md p-4 bg-gray-50">
            <a
              href={block.data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              {block.data.meta?.title || block.data.link}
            </a>
            {block.data.meta?.description && (
              <p className="text-sm text-gray-600 mt-1">
                {block.data.meta.description}
              </p>
            )}
            {block.data.meta?.image?.url && (
              <img
                src={block.data.meta.image.url}
                alt="link preview"
                className="mt-3 rounded-lg w-full max-w-md"
              />
            )}
          </div>
        );

      // --- Delimiter ---
      case "delimiter":
        return <hr key={index} className="my-8 border-gray-300" />;

      default:
        return null;
    }
  });
};

// --- Main Component ---
const PostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params;
    const response = await axios.get<PostDetail>(
      `${apiUrl}/api/public/blog/posts/${slug}`,
      { headers: { "Cache-Control": "no-cache" } }
    );
    const post = response.data;

    return (
      <article className="bg-white">
        {/* --- Header Image --- */}
        {post.featuredImageUrl && (
          <header className="relative h-96">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center p-4">
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

        {/* --- Content Section --- */}
        <section className="py-8 md:py-12 px-6 lg:px-16">
          <div className="max-w-screen-lg mx-auto space-y-10">
            <div className="custom-post">
              {renderBlockContent(post.content)}
            </div>

            <div className="mt-8 border-t pt-8">
              <h3 className="text-3xl font-bold text-gray-900">Comments</h3>
              <p className="text-base text-gray-600 mt-2">
                Comments are coming soon!
              </p>
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
