'use client'; 
import React, { useState, useEffect, useCallback, FormEvent, FC } from 'react'; 
import { toast, ToastContainer } from 'react-toastify'; 
import axios from 'axios'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions --- 
interface Post { 
  id: number; 
  title: string; 
  slug: string; 
  status: string; 
  authorName: string; 
  updatedAt: string; 
} 

interface Category { 
  id: number; 
  name: string; 
  slug: string; 
  description: string; 
  parentId: number | null; 
  children?: Category[];
} 

interface Tag { 
  id: number; 
  name: string; 
  slug: string; 
} 

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
}

interface TagFormData {
  name: string;
  slug: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; 

const getAuthHeaders = () => { 
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null; 
  return token ? { Authorization: `Bearer ${token}` } : {}; 
}; 

// --- SVG Icons --- 
const PlusIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>; 
const ViewIcon: FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; 

// --- MODAL COMPONENTS for Categories and Tags --- 
const CategoryModal: FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: CategoryFormData) => void; 
  categoryToEdit: Category | null; 
  allCategories: Category[] 
}> = ({ isOpen, onClose, onSave, categoryToEdit, allCategories }) => { 
  const [name, setName] = useState(categoryToEdit?.name || ''); 
  const [slug, setSlug] = useState(categoryToEdit?.slug || ''); 
  const [description, setDescription] = useState(categoryToEdit?.description || ''); 
  const [parentId, setParentId] = useState<string>(categoryToEdit?.parentId?.toString() || ''); 

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setDescription(categoryToEdit.description);
      setParentId(categoryToEdit.parentId?.toString() || '');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setParentId('');
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: FormEvent) => { 
    e.preventDefault(); 
    onSave({ 
      name, 
      slug, 
      description, 
      parentId: parentId ? parseInt(parentId) : null 
    }); 
  }; 

  if (!isOpen) return null; 

  return ( 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> 
      <div className="bg-white rounded-lg p-6 max-w-lg w-full"> 
        <form onSubmit={handleSubmit} className="space-y-4"> 
          <h3 className="text-lg font-bold">{categoryToEdit ? 'Edit' : 'Add New'} Category</h3> 
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" /> 
          <input type="text" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full p-2 border rounded" /> 
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded"></textarea> 
          <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full p-2 border rounded"> 
            <option value="">-- No Parent (Top Level) --</option> 
            {allCategories
              .filter(c => !categoryToEdit || c.id !== categoryToEdit.id) // Don&apos;t allow selecting self as parent
              .map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)} 
          </select> 
          <div className="flex justify-end gap-2"> 
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button> 
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button> 
          </div> 
        </form> 
      </div> 
    </div> 
  ); 
}; 

const TagModal: FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: TagFormData) => void; 
  tagToEdit: Tag | null 
}> = ({ isOpen, onClose, onSave, tagToEdit }) => { 
  const [name, setName] = useState(tagToEdit?.name || ''); 
  const [slug, setSlug] = useState(tagToEdit?.slug || ''); 

  useEffect(() => {
    if (tagToEdit) {
      setName(tagToEdit.name);
      setSlug(tagToEdit.slug);
    } else {
      setName('');
      setSlug('');
    }
  }, [tagToEdit, isOpen]);

  const handleSubmit = (e: FormEvent) => { 
    e.preventDefault(); 
    onSave({ name, slug }); 
  }; 

  if (!isOpen) return null; 

  return ( 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> 
      <div className="bg-white rounded-lg p-6 max-w-lg w-full"> 
        <form onSubmit={handleSubmit} className="space-y-4"> 
          <h3 className="text-lg font-bold">{tagToEdit ? 'Edit' : 'Add New'} Tag</h3> 
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" /> 
          <input type="text" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full p-2 border rounded" /> 
          <div className="flex justify-end gap-2"> 
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button> 
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button> 
          </div> 
        </form> 
      </div> 
    </div> 
  ); 
}; 

// --- Helper function to build category hierarchy ---
const buildCategoryHierarchy = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category & { children: Category[] }>();
  
  // First pass: create a map of all categories with empty children arrays
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });
  
  // Second pass: build the hierarchy
  const hierarchy: Category[] = [];
  
  categoryMap.forEach(category => {
    if (category.parentId && categoryMap.has(category.parentId)) {
      // This is a child category, add it to its parent's children
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      // This is a top-level category
      hierarchy.push(category);
    }
  });
  
  return hierarchy;
};

// --- Recursive component for rendering category hierarchy ---
const CategoryItem: FC<{ 
  category: Category & { children?: Category[] }; 
  onEdit: (category: Category) => void; 
  onDelete: (categoryId: number) => void; 
  allCategories: Category[];
}> = ({ category, onEdit, onDelete, allCategories }) => {
  return (
    <li className="p-2 border rounded-md bg-gray-50 mb-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">
          {category.name} 
          <span className="text-gray-500 text-sm font-normal">({category.slug})</span>
          {category.parentId && (
            <span className="text-xs text-gray-400 ml-2">
              Parent: {allCategories.find(c => c.id === category.parentId)?.name || 'Unknown'}
            </span>
          )}
        </span>
        <div className="space-x-2">
          <button 
            type="button" 
            onClick={() => onEdit(category)} 
            className="text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(category.id)} 
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
      
      {category.children && category.children.length > 0 && (
        <ul className="mt-2 ml-6 space-y-2">
          {category.children.map(child => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              allCategories={allCategories}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// --- MANAGER COMPONENTS --- 
const CategoryManager: FC<{ initialCategories: Category[], refreshData: () => void }> = ({ initialCategories, refreshData }) => { 
  const [isModalOpen, setModalOpen] = useState(false); 
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); 
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Build category hierarchy whenever initialCategories changes
    setHierarchicalCategories(buildCategoryHierarchy(initialCategories));
  }, [initialCategories]);

  const handleSave = async (categoryData: CategoryFormData) => { 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      if (editingCategory) { 
        await axios.put(`${apiUrl}/api/admin/blog/categories/${editingCategory.id}`, categoryData, { headers }); 
        toast.success("Category updated!"); 
      } else { 
        await axios.post(`${apiUrl}/api/admin/blog/categories`, categoryData, { headers }); 
        toast.success("Category created!"); 
      } 
      setEditingCategory(null); 
      setModalOpen(false); 
      refreshData(); 
    } catch (err) { 
      console.error(err);
      toast.error("Failed to save category."); 
    } 
  }; 

  const handleDelete = async (categoryId: number) => { 
    if (!window.confirm("Are you sure? Deleting a category can affect existing posts.")) return; 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      await axios.delete(`${apiUrl}/api/admin/blog/categories/${categoryId}`, { headers }); 
      toast.success("Category deleted."); 
      refreshData(); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to delete category."); 
    } 
  }; 

  return ( 
    <div className="bg-white p-6 rounded-lg shadow-md"> 
      <div className="flex justify-between items-center mb-4"> 
        <h2 className="text-xl font-bold">Manage Categories</h2> 
        <button type="button" onClick={() => { setEditingCategory(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"><PlusIcon /> Add Category</button> 
      </div> 
      
      {hierarchicalCategories.length === 0 ? (
        <p className="text-gray-500">No categories found. Create your first category!</p>
      ) : (
        <ul className="space-y-2"> 
          {hierarchicalCategories.map(category => (
            <CategoryItem 
              key={category.id} 
              category={category} 
              onEdit={(cat) => {
                setEditingCategory(cat);
                setModalOpen(true);
              }} 
              onDelete={handleDelete} 
              allCategories={initialCategories}
            />
          ))} 
        </ul>
      )}
      
      {isModalOpen && (
        <CategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSave} 
          categoryToEdit={editingCategory} 
          allCategories={initialCategories} 
        />
      )}
    </div> 
  ); 
}; 

const TagManager: FC<{ initialTags: Tag[], refreshData: () => void }> = ({ initialTags, refreshData }) => { 
  const [isModalOpen, setModalOpen] = useState(false); 
  const [editingTag, setEditingTag] = useState<Tag | null>(null); 

  const handleSave = async (tagData: TagFormData) => { 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      if (editingTag) { 
        await axios.put(`${apiUrl}/api/admin/blog/tags/${editingTag.id}`, tagData, { headers }); 
        toast.success("Tag updated!"); 
      } else { 
        await axios.post(`${apiUrl}/api/admin/blog/tags`, tagData, { headers }); 
        toast.success("Tag created!"); 
      } 
      setEditingTag(null); 
      setModalOpen(false); 
      refreshData(); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to save tag."); 
    } 
  }; 

  const handleDelete = async (tagId: number) => { 
    if (!window.confirm("Are you sure you want to delete this tag?")) return; 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      await axios.delete(`${apiUrl}/api/admin/blog/tags/${tagId}`, { headers }); 
      toast.success("Tag deleted."); 
      refreshData(); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to delete tag."); 
    } 
  }; 

  return ( 
    <div className="bg-white p-6 rounded-lg shadow-md"> 
      <div className="flex justify-between items-center mb-4"> 
        <h2 className="text-xl font-bold">Manage Tags</h2> 
        <button type="button" onClick={() => { setEditingTag(null); setModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"><PlusIcon /> Add Tag</button> 
      </div> 
      <ul className="space-y-2"> 
        {initialTags.map(tag => ( 
          <li key={tag.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"> 
            <span>{tag.name} <span className="text-gray-500 text-sm">({tag.slug})</span></span> 
            <div className="space-x-2"> 
              <button type="button" onClick={() => { setEditingTag(tag); setModalOpen(true); }} className="text-blue-500 hover:underline">Edit</button> 
              <button type="button" onClick={() => handleDelete(tag.id)} className="text-red-500 hover:underline">Delete</button> 
            </div> 
          </li> 
        ))} 
      </ul> 
      {isModalOpen && <TagModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} tagToEdit={editingTag} />} 
    </div> 
  ); 
}; 

// --- Main Page Component --- 
const AdminBlogPage: React.FC = () => { 
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags'>('posts'); 
  const [posts, setPosts] = useState<Post[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); 
  const [tags, setTags] = useState<Tag[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter(); 

  const fetchData = useCallback(async () => { 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) { 
      router.push('/login'); 
      return; 
    } 
    setIsLoading(true); 
    try { 
      const [postsRes, catsRes, tagsRes] = await Promise.all([ 
        axios.get(`${apiUrl}/api/admin/blog/posts`, { headers }), 
        axios.get(`${apiUrl}/api/admin/blog/categories`, { headers }), 
        axios.get(`${apiUrl}/api/admin/blog/tags`, { headers }), 
      ]); 
      setPosts(postsRes.data || []); 
      setCategories(catsRes.data || []); 
      setTags(tagsRes.data || []); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to load blog data."); 
    } finally { 
      setIsLoading(false); 
    } 
  }, [router]); 

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]); 

  const deletePost = async (postId: number) => { 
    if (!window.confirm("Are you sure?")) return; 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      await axios.delete(`${apiUrl}/api/admin/blog/posts/${postId}`, { headers }); 
      toast.success("Post deleted."); 
      fetchData(); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to delete post."); 
    } 
  }; 

  const handleStatusChange = async (postId: number, newStatus: string) => { 
    const headers = getAuthHeaders(); 
    if (!headers.Authorization) return; 
    try { 
      await axios.put(`${apiUrl}/api/admin/blog/posts/${postId}/status`, { status: newStatus }, { headers }); 
      toast.success("Status updated!"); 
      fetchData(); 
    } catch (err) { 
          console.error(err);
      toast.error("Failed to update status."); 
    } 
  }; 

  if (isLoading) { 
    return <div className="p-6">Loading...</div>; 
  } 

  return ( 
    <> 
      <ToastContainer position="bottom-right" autoClose={3000} /> 
      <div className="p-4 sm:p-6 lg:p-8"> 
        <header className="mb-8 flex justify-between items-center"> 
          <div> 
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1> 
            <p className="mt-1 text-sm text-gray-600">Manage all content for your website&apos;s blog.</p> 
          </div> 
          {activeTab === 'posts' && ( 
            <Link href="/admin/blog/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"> 
              <PlusIcon /> Create New Post 
            </Link> 
          )} 
        </header> 
        <div className="mb-6 border-b border-gray-200"> 
          <nav className="-mb-px flex space-x-8" aria-label="Tabs"> 
            <button type="button" onClick={() => setActiveTab('posts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Posts</button> 
            <button type="button" onClick={() => setActiveTab('categories')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Categories</button> 
            <button type="button" onClick={() => setActiveTab('tags')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tags' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Tags</button> 
          </nav> 
        </div> 
        <div> 
          {activeTab === 'posts' && ( 
            <div className="bg-white shadow-md rounded-lg overflow-hidden"> 
              <table className="min-w-full divide-y divide-gray-200"> 
                <thead className="bg-gray-50"> 
                  <tr> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Modified</th> 
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th> 
                  </tr> 
                </thead> 
                <tbody className="bg-white divide-y divide-gray-200"> 
                  {posts.map((post) => ( 
                    <tr key={post.id}> 
                      <td className="px-6 py-4"> 
                        <div className="font-medium text-gray-900">{post.title}</div> 
                        <div className="text-sm text-gray-500">/{post.slug}</div> 
                      </td> 
                      <td className="px-6 py-4 text-sm text-gray-500">{post.authorName}</td> 
                      <td className="px-6 py-4"> 
                        <select value={post.status} onChange={(e) => handleStatusChange(post.id, e.target.value)} className="text-xs p-1 border-gray-300 rounded-md"> 
                          <option value="DRAFT">Draft</option> 
                          <option value="PUBLISHED">Published</option> 
                          <option value="PENDING_REVIEW">Pending Review</option> 
                          <option value="SCHEDULED">Scheduled</option> 
                        </select> 
                      </td> 
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(post.updatedAt).toLocaleDateString()}</td> 
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2"> 
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"> 
                          <ViewIcon/> View 
                        </a> 
                        <Link href={`/admin/blog/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link> 
                        <button type="button" onClick={() => deletePost(post.id)} className="text-red-600 hover:text-red-900">Delete</button> 
                      </td> 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
          )} 
          {activeTab === 'categories' && <CategoryManager initialCategories={categories} refreshData={fetchData} />} 
          {activeTab === 'tags' && <TagManager initialTags={tags} refreshData={fetchData} />} 
        </div> 
      </div> 
    </> 
  ); 
}; 

export default AdminBlogPage;