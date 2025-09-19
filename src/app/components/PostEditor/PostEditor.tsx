'use client';

import React, { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import EditorJS, { OutputData } from '@editorjs/editorjs';

// Editor.js tools
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';
import CodeTool from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';

interface Category { id: number; name: string; slug: string; parentId?: number | null; children?: Category[]; }
interface Tag { id: number; name: string; slug: string; }
interface MediaItem { id: number; mediaUrl: string; altText?: string; fileName?: string; }
interface Expert { id: number; name: string; title: string; bio: string; image: string; }

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : null;
};

const PostEditor: React.FC<{ postToEdit?: any | null }> = ({ postToEdit }) => {
  const router = useRouter();

  // Post fields state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [content, setContent] = useState<OutputData>({ blocks: [] });

  // SEO states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleSuffix, setMetaTitleSuffix] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [serpPreviewText, setSerpPreviewText] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaRobots, setMetaRobots] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // OG data
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState<MediaItem | null>(null);

  // Twitter data
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [twitterTitle, setTwitterTitle] = useState('');
  const [twitterDescription, setTwitterDescription] = useState('');
  const [twitterImage, setTwitterImage] = useState<MediaItem | null>(null);

  // Advanced meta
  const [structuredData, setStructuredData] = useState('');
  const [customMetaTags, setCustomMetaTags] = useState('');

  // Taxonomy and experts
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<number[]>([]);

  // Media states
  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedMediaTab, setSelectedMediaTab] = useState<'upload' | 'library'>('library');

  // EditorJS related refs and constants
  const editorRef = useRef<EditorJS | null>(null);
  const contentRef = useRef<OutputData>({ blocks: [] }); // store latest content without causing renders
  const editorContainerId = 'editorjs-container';

  // Slug input ref to focus
  const slugInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaTarget, setMediaTarget] = useState<'featured' | 'og' | 'twitter' | 'editor' | null>(null);

  // Slug generator helper
  const generateSlug = useCallback((value: string) => {
    return value.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-').replace(/^-+|-+$/g, '');
  }, []);

  // Load post data into state when editing or postToEdit changes
  useEffect(() => {
    if(!postToEdit) return;

    setTitle(postToEdit.title || '');
    setSlug(postToEdit.slug || '');
    setAutoSlug(postToEdit.slug ? false : true);
    setExcerpt(postToEdit.excerpt || '');
    setStatus(postToEdit.status || 'draft');
   
    setContent(postToEdit.content || { blocks: [] });
    contentRef.current = postToEdit.content || { blocks: [] };

    /*
   // this blog only user if json is stringfyes
    let parsedContent = { blocks: [] };
    try {
    parsedContent = typeof postToEdit.content === 'string'
      ? JSON.parse(postToEdit.content)
      : postToEdit.content;
  } catch (err) {
    console.error('Failed to parse content JSON', err);
  }
  setContent(parsedContent);
  contentRef.current = parsedContent;*/

    const seo = postToEdit.seoMetadata || {};
    setMetaTitle(seo.metaTitle || '');
    setMetaTitleSuffix(seo.metaTitleSuffix || '');
    setMetaDescription(seo.metaDescription || '');
    setSerpPreviewText(seo.serpPreviewText || '');
    setMetaKeywords(seo.metaKeywords || '');
    setMetaRobots(seo.metaRobots || '');
    setCanonicalUrl(seo.canonicalUrl || '');

    setOgTitle(seo.ogTitle || '');
    setOgDescription(seo.ogDescription || '');
    setOgImage(postToEdit.ogImage || null);

    setTwitterCard(seo.twitterCard || 'summary_large_image');
    setTwitterTitle(seo.twitterTitle || '');
    setTwitterDescription(seo.twitterDescription || '');
    setTwitterImage(postToEdit.twitterImage || null);

    setStructuredData(seo.structuredData ? JSON.stringify(seo.structuredData, null, 2) : '');
    setCustomMetaTags(seo.customMetaTags ? JSON.stringify(seo.customMetaTags, null, 2) : '');

    setFeaturedImage(postToEdit.featuredImage || null);

    setSelectedCategories(postToEdit.categories ? postToEdit.categories.map((cat: Category) => cat.id) : []);
    setSelectedTags(postToEdit.tags || []);
    //setSelectedTags(postToEdit.tags ? postToEdit.tags.map((tag: Tag) => tag.id) : []);
    setSelectedExperts(postToEdit.experts || []);
  }, [postToEdit]);


   // Auto update slug when title changes and autoSlug is true
  useEffect(() => {
    if(autoSlug) {
      setSlug(generateSlug(title || ''));
    }
  }, [title, autoSlug, generateSlug]);

  // --- EditorJS init ---
  useEffect(() => {
    if(editorRef.current) return;  // Only initialize once

    const editor = new EditorJS({
      holder: editorContainerId,
      placeholder: 'Start writing your story...',
      data: contentRef.current,
      autofocus: true,
      tools: {
        header: { class: Header as any, inlineToolbar: true, config: { levels: [1, 2, 3, 4], defaultLevel: 2 } },
        list: { class: List as any, inlineToolbar: true },
        quote: { class: Quote as any },
        checklist: { class: Checklist as any },
        table: { class: Table as any },
        embed: { class: Embed as any },
        code: { class: CodeTool as any },
        inlineCode: { class: InlineCode as any },
        linkTool: { class: LinkTool as any, config: { endpoint: `${apiUrl}/api/fetchUrl` } },
        delimiter: { class: Delimiter as any },
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: `${apiUrl}/api/admin/media/upload`,
              byUrl: `${apiUrl}/api/admin/media/fetch`
            },
            additionalRequestHeaders: getAuthHeaders() || {}
          }
        },
      },
      onReady: () => { },
      onChange: async () => {
        try {
          const saved = await editor.saver.save();
          contentRef.current = saved;  // update ref, avoid React re-render to prevent cursor jumps
        } catch (error) {
          console.error('Editor save error', error);
        }
      }
    });

    editorRef.current = editor;

    return () => {
      if(editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // --- fetch meta data (categories, tags, experts, media) ---
  useEffect(() => {
    const fetchAll = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      try {
        const [catsRes, tagsRes, expertsRes, mediaRes] = await Promise.all([
          axios.get(`${apiUrl}/api/admin/blog/categories`, { headers }),
          axios.get(`${apiUrl}/api/admin/blog/tags`, { headers }),
          axios.get(`${apiUrl}/api/admin/experts`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/api/admin/media`, { headers }).catch(() => ({ data: [] }))
        ]);
        setCategories(catsRes.data || []);
        setTags(tagsRes.data || []);
        setExperts(expertsRes.data || []);
        setMediaItems(mediaRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load admin data');
      }
    };
    fetchAll();
  }, []);

  // --- file upload handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const headers = getAuthHeaders();
    if (!headers) {
      toast.error('Not authenticated');
      return;
    }
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await axios.post(`${apiUrl}/api/admin/media/upload`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      const item: MediaItem = res.data;
      setMediaItems(prev => [item, ...prev]);
      toast.success('Uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  // --- media tile action handler ---
  const handleMediaAction = (item: MediaItem, action: 'insert' | 'featured' | 'og' | 'twitter') => {
    if (action === 'insert') {
      try {
        (editorRef.current as any)?.blocks?.insert('image', {
          file: { url: item.mediaUrl },
          caption: item.altText || '',
        }, {}, undefined);
      } catch (err) {
        console.error('Insert into editor failed', err);
        toast.error('Insert failed');
      }
    } else if (action === 'featured') {
      setFeaturedImage(item);
    } else if (action === 'og') {
      setOgImage(item);
    } else if (action === 'twitter') {
      setTwitterImage(item);
    }
    setShowMediaLibrary(false);
    setMediaTarget(null);
  };

function flattenCategoryIds(categories: Category[]): number[] {
  let ids: number[] = [];

  categories.forEach(cat => {
    ids.push(cat.id);
    if (cat.children && cat.children.length > 0) {
      ids = ids.concat(flattenCategoryIds(cat.children)); // recursive flatten
    }
  });

  return ids;
}


  // --- submit handler ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if(editorRef.current) {
      try {
        const saved = await editorRef.current.save();
       setContent(saved);         // update React state if needed
      contentRef.current = saved; // keep fresh in ref
      } catch(err) {
        console.error('Save before submit failed', err);
        toast.error('Failed to save editor content');
        return;
      }
    }

    const seoMetadata = {
      metaTitle: metaTitle || title,
      metaTitleSuffix,
      metaDescription,
      serpPreviewText,
      metaKeywords,
      metaRobots,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageId: ogImage?.id || null,
      ogImageAlt: ogImage?.altText || null,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImageId: twitterImage?.id || null,
      twitterImageAlt: twitterImage?.altText || null,
      structuredData: structuredData ? (() => { try { return JSON.parse(structuredData); } catch { return null; } })() : null,
      customMetaTags: customMetaTags ? (() => { try { return JSON.parse(customMetaTags); } catch { return null; } })() : null
    };


const categoryIds = flattenCategoryIds(categories.filter(cat => selectedCategories.includes(cat.id)));
    const payload = {
      title,
      slug,
      excerpt,
      status,
      //content: JSON.stringify(contentRef.current),
      content: contentRef.current,
      featuredImageId: featuredImage?.id || null,
     categoryIds,
      tagIds: selectedTags,
      experts: selectedExperts,
      seoMetadata
    };

    const headers = getAuthHeaders();
    if(!headers) {
      toast.error('Not authenticated');
      return;
    }

    try {
      if(postToEdit) {
        console.log('Updating post with payload:', payload);
        await axios.put(`${apiUrl}/api/admin/blog/posts/${postToEdit.id}`, payload, { headers });
        toast.success('Post updated!');
      } else {
        await axios.post(`${apiUrl}/api/admin/blog/posts`, payload, { headers });
        toast.success('Post created!');
      }
      router.push('/admin/blog');
    } catch(err) {
      console.error(err);
      toast.error('Save failed');
    }
  };
  // open media modal for a target context
  const openMediaModalFor = (target: 'featured' | 'og' | 'twitter' | 'editor') => {
    setMediaTarget(target);
    setSelectedMediaTab('library');
    setShowMediaLibrary(true);
  };

  // helper to focus slug input
  const focusSlugInput = () => {
    setTimeout(() => slugInputRef.current?.focus(), 50);
  };

  // --- SEO score helper ---
 const getSeoScore = () => {
    const titleLen = (metaTitle || title).length;
    const descLen = metaDescription.length;
    const hasKeyword = metaKeywords
      ? metaKeywords.split(',').map(k => k.trim().toLowerCase()).some(k => (title + ' ' + metaDescription).toLowerCase().includes(k))
      : false;
    let score = 0;
    if(titleLen >= 30 && titleLen <= 60) score++;
    if(descLen >= 50 && descLen <= 160) score++;
    if(metaKeywords && hasKeyword) score++;
    if(score === 3) return { label: 'Good SEO score', color: 'bg-green-500' };
    if(score === 2) return { label: 'Needs Improvement', color: 'bg-yellow-400' };
    return { label: 'Poor SEO', color: 'bg-red-500' };
  };
  const seoScore = getSeoScore();

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        {/* Left main content */}
        <div className="flex-1 space-y-6">
          {/* Title + Slug */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block font-semibold">Title</label>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); if (autoSlug) setSlug(generateSlug(e.target.value)); }}
              placeholder="Enter post title..."
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:outline-indigo-500"
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mr-2">Slug</label>
                <input
                  ref={slugInputRef}
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setAutoSlug(false); }}
                  className="border px-3 py-1 rounded flex-1"
                  placeholder="post-slug"
                  aria-label="post slug"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setAutoSlug(false); focusSlugInput(); }}
                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { const g = generateSlug(title || ''); setSlug(g); setAutoSlug(false); toast.info('Slug regenerated from title'); }}
                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                  Regenerate
                </button>
                <label className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => { setAutoSlug(e.target.checked); if (e.target.checked) setSlug(generateSlug(title || '')); }}
                  />
                  Auto
                </label>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block font-semibold">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Enter a brief excerpt..."
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:outline-indigo-500 min-h-[100px]"
            />
          </div>

          {/* Editor.js */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block font-semibold mb-2">Content</label>
            <div id={editorContainerId} className="min-h-[320px] border rounded p-3 bg-white" />
          </div>

          {/* SEO Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-semibold">SEO Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Meta title"
                />
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">{(metaTitle || title).length}/60 chars</span>
                  <span
                    className={`font-semibold ${
                      (metaTitle || title).length < 30
                        ? "text-red-500"
                        : (metaTitle || title).length <= 60
                        ? "text-green-600"
                        : "text-yellow-500"
                    }`}
                  >
                    {(metaTitle || title).length < 30
                      ? "Too short"
                      : (metaTitle || title).length <= 60
                      ? "Good"
                      : "Too long"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title Suffix</label>
                <input
                  value={metaTitleSuffix}
                  onChange={e => setMetaTitleSuffix(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="| My Site"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Canonical Url</label>
                <input
                  value={canonicalUrl}
                  onChange={e => setCanonicalUrl(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="https://teamhippa.com/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Keywords (comma separated)</label>
                <input
                  value={metaKeywords}
                  onChange={e => setMetaKeywords(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="keyword1, keyword2"
                  maxLength={255}
                />
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">{metaKeywords.length}/255 chars</span>
                  <span
                    className={
                      metaKeywords.length === 0
                        ? 'font-semibold text-red-500'
                        : metaKeywords.length > 0 && metaKeywords.length <= 255
                        ? 'font-semibold text-green-600'
                        : 'font-semibold text-yellow-500'
                    }
                  >
                    {metaKeywords.length === 0
                      ? 'Missing'
                      : metaKeywords.length <= 255
                      ? 'OK'
                      : 'Too long'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Meta description"
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-gray-500">{metaDescription.length}/160 chars</span>
                <span
                  className={`font-semibold ${
                    metaDescription.length < 50
                      ? "text-red-500"
                      : metaDescription.length <= 160
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                >
                  {metaDescription.length < 50
                    ? "Too short"
                    : metaDescription.length <= 160
                    ? "Good"
                    : "Too long"}
                </span>
              </div>
            </div>

            {/* SERP Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4 border">
              <h4 className="text-sm font-semibold mb-2">Google SERP Preview</h4>
              <div className="space-y-1">
                <div className="text-indigo-700 text-lg truncate">
                  {(metaTitle || title).slice(0, 60)} {metaTitleSuffix}
                </div>
                <div className="text-green-700 text-sm">{canonicalUrl || "https://example.com/sample-post"}</div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {metaDescription
                    ? metaDescription.slice(0, 160)
                    : "This is how your meta description will appear in search results."}
                </div>
              </div>
            </div>

            {/* SEO Score Indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-4 h-4 rounded-full ${seoScore.color}`}></div>
              <span className="text-sm">{seoScore.label}</span>
            </div>
          </div>

          {/* Open Graph */}
          <div className="pt-2 border-t">
            <h4 className="font-medium mt-3 mb-2">Open Graph (Social)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">OG Title</label>
                <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">OG Image</label>
                {ogImage ? (
                  <img src={ogImage.mediaUrl} alt={ogImage.altText || ''} className="w-full h-28 object-cover rounded mb-2" />
                ) : (
                  <div className="text-sm text-gray-500 mb-2">No image selected</div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => openMediaModalFor('og')} className="text-sm bg-gray-100 px-3 py-1 rounded">Choose OG Image</button>
                  <button type="button" onClick={() => setOgImage(null)} className="text-sm text-red-600 px-3 py-1 rounded">Remove</button>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">OG Description</label>
              <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} className="w-full border px-3 py-2 rounded" rows={2} />
            </div>
          </div>

          {/* Twitter */}
          <div className="pt-2 border-t">
            <h4 className="font-medium mt-3 mb-2">Twitter Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Card Type</label>
                <select value={twitterCard} onChange={e => setTwitterCard(e.target.value)} className="w-full border px-3 py-2 rounded">
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Image</label>
                {twitterImage ? (
                  <img src={twitterImage.mediaUrl} alt={twitterImage.altText || ''} className="w-full h-28 object-cover rounded mb-2" />
                ) : (
                  <div className="text-sm text-gray-500 mb-2">No image selected</div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => openMediaModalFor('twitter')} className="text-sm bg-gray-100 px-3 py-1 rounded">Choose Twitter Image</button>
                  <button type="button" onClick={() => setTwitterImage(null)} className="text-sm text-red-600 px-3 py-1 rounded">Remove</button>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Title</label>
                <input value={twitterTitle} onChange={e => setTwitterTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Description</label>
                <input value={twitterDescription} onChange={e => setTwitterDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>
            </div>
          </div>

          {/* Advanced: structured data & custom meta tags */}
          <div className="pt-2 border-t">
            <h4 className="font-medium mt-3 mb-2">Advanced</h4>
            <div>
              <label className="block text-sm font-medium mb-1">Structured Data (JSON-LD)</label>
              <textarea
                value={structuredData}
                onChange={e => setStructuredData(e.target.value)}
                className="w-full border px-3 py-2 rounded font-mono"
                rows={6}
                placeholder='{"@context":"https://schema.org", ...}'
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Custom Meta Tags (JSON)</label>
              <textarea
                value={customMetaTags}
                onChange={e => setCustomMetaTags(e.target.value)}
                className="w-full border px-3 py-2 rounded font-mono"
                rows={4}
                placeholder='[{"name":"robots","content":"noindex"}]'
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-full lg:w-96 space-y-6">
          {/* Publish */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Publish</h3>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border px-3 py-2 rounded mb-4">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg w-full">Save</button>
          </div>
          {/* Media Library */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Media Library</h3>
            <button type="button" onClick={() => openMediaModalFor('featured')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg w-full">Select from Media Library</button>
          </div>
          {/* Featured image */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Featured Image</h3>
            {featuredImage ? (
              <>
                <img src={featuredImage.mediaUrl} alt={featuredImage.altText || ''} className="w-full h-48 object-cover rounded mb-2" />
                <div className="flex justify-between">
                  <button type="button" onClick={() => openMediaModalFor('featured')} className="text-sm text-indigo-600">Replace</button>
                  <button type="button" onClick={() => setFeaturedImage(null)} className="text-sm text-red-600">Remove</button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => openMediaModalFor('featured')} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400">Set featured image</button>
            )}
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="max-h-60 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center mb-2">
                  <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => setSelectedCategories(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])} className="mr-2" />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Tags</h3>
            <div className="max-h-60 overflow-y-auto">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center mb-2">
                  <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id])} className="mr-2" />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          {/* Experts */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Experts</h3>
            <div className="max-h-60 overflow-y-auto">
              {experts.map(ex => (
                <label key={ex.id} className="flex items-center mb-3">
                  <input type="checkbox" checked={selectedExperts.includes(ex.id)} onChange={() => setSelectedExperts(prev => prev.includes(ex.id) ? prev.filter(x => x !== ex.id) : [...prev, ex.id])} className="mr-2" />
                  <div className="flex items-center">
                    <img src={ex.image} alt={ex.name} className="h-8 w-8 rounded-full object-cover mr-2" />
                    <div>
                      <div className="font-medium text-sm">{ex.name}</div>
                      <div className="text-xs text-gray-500">{ex.title}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </aside>
      </form>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Media Library</h3>
              <div className="flex items-center gap-2">
                <div className="flex border rounded overflow-hidden">
                  <button className={`px-4 py-2 ${selectedMediaTab === 'library' ? 'bg-white text-indigo-600' : 'text-gray-600'}`} onClick={() => setSelectedMediaTab('library')}>Library</button>
                  <button className={`px-4 py-2 ${selectedMediaTab === 'upload' ? 'bg-white text-indigo-600' : 'text-gray-600'}`} onClick={() => setSelectedMediaTab('upload')}>Upload</button>
                </div>
                <button onClick={() => { setShowMediaLibrary(false); setMediaTarget(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              {selectedMediaTab === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input id="admin-file-upload" type="file" onChange={handleFileUpload} className="hidden" />
                  <label htmlFor="admin-file-upload" className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg inline-block">Select Files</label>
                  <p className="mt-2 text-sm text-gray-500">or drag and drop files here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map(item => (
                    <div key={item.id} className="border rounded-lg overflow-hidden relative">
                      <img src={item.mediaUrl} alt={item.altText || ''} className="w-full h-40 object-cover" />
                      <div className="p-2">
                        <div className="text-sm truncate mb-2">{item.fileName || item.mediaUrl.split('/').pop()}</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleMediaAction(item, 'insert')} className="text-xs bg-gray-100 px-2 py-1 rounded">Insert</button>
                          <button onClick={() => handleMediaAction(item, 'featured')} className="text-xs bg-gray-100 px-2 py-1 rounded">Featured</button>
                          <button onClick={() => handleMediaAction(item, 'og')} className="text-xs bg-gray-100 px-2 py-1 rounded">OG</button>
                          <button onClick={() => handleMediaAction(item, 'twitter')} className="text-xs bg-gray-100 px-2 py-1 rounded">Twitter</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostEditor;
