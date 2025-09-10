"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  useMemo,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";

// --- Type Definitions ---
interface GalleryItem {
  id: number;
  title: string;
  description: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder?: number;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;

}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- API Helper ---
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

// --- SVG Icons ---
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
    />
  </svg>
);
const ExpandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// --- Helper function to get proper image URLs ---
const getImageUrl = (url: string | undefined) => {
  if (!url) return "";

  // If URL is already absolute, return as-is
  if (url.startsWith("http")) return url;

  // If URL is relative, prepend API URL
  return `${apiUrl}${url.startsWith("/") ? url : "/" + url}`;
};

// --- Main Page Component ---
const AdminGalleryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"items" | "categories" | "tags">(
    "items"
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    try {
      const [itemsRes, catsRes, tagsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/gallery`, { headers }),
        axios.get(`${apiUrl}/api/admin/gallery/categories`, { headers }),
        axios.get(`${apiUrl}/api/admin/gallery/tags`, { headers }),
      ]);

      // Debug: Check what the API returns
      console.log("Gallery items response:", itemsRes.data);
      if (itemsRes.data && itemsRes.data.length > 0) {
        console.log(
          "First item media URL:",
          getImageUrl(itemsRes.data[0].mediaUrl)
        );
        console.log(
          "First item thumbnail URL:",
          getImageUrl(itemsRes.data[0].thumbnailUrl)
        );
      }

      setGalleryItems(itemsRes.data || []);
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
    } catch {
      toast.error("Failed to load gallery data.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteItem = async (itemId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    )
      return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${apiUrl}/api/admin/gallery/${itemId}`, { headers });
      toast.success("Item deleted successfully.");
      fetchData();
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <header className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gallery Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload, edit, and organize your media.
            </p>
          </div>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("items")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "items"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Gallery Items
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tags"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tags
            </button>
          </nav>
        </div>

        <div>
          {activeTab === "items" && (
            <GalleryGrid
              items={galleryItems}
              categories={categories}
              onEdit={(item) => {
                setEditingItem(item);
                setItemModalOpen(true);
              }}
              onDelete={handleDeleteItem}
              onAdd={() => {
                setEditingItem(null);
                setItemModalOpen(true);
              }}
            />
          )}
          {activeTab === "categories" && (
            <CategoryManager
              initialCategories={categories}
              refreshData={fetchData}
            />
          )}
          {activeTab === "tags" && (
            <TagManager initialTags={tags} refreshData={fetchData} />
          )}
        </div>

        {isItemModalOpen && (
          <UploadEditModal
            isOpen={isItemModalOpen}
            onClose={() => setItemModalOpen(false)}
            itemToEdit={editingItem}
            categories={categories}
            tags={tags}
            onSuccess={fetchData}
          />
        )}
      </div>
    </>
  );
};

// --- Media Lightbox Component ---
const Lightbox: React.FC<{ item: GalleryItem; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-[110]"
      >
        <CloseIcon />
      </button>
      <div
        className="relative max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {item.mediaType === "IMAGE" ? (
          <img
            src={getImageUrl(item.mediaUrl)}
            alt={item.altText || item.title}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Failed to load image in lightbox:", e);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <video
            src={getImageUrl(item.mediaUrl)}
            controls
            autoPlay
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Failed to load video in lightbox:", e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

// --- Pagination Component ---
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === number
              ? "bg-green-600 text-white border border-green-600"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
};

// --- Gallery Grid Component ---
const GalleryGrid: React.FC<{
  items: GalleryItem[];
  categories: Category[];
  onEdit: (item: GalleryItem) => void;
  onDelete: (itemId: number) => void;
  onAdd: () => void;
}> = ({ items, categories, onEdit, onDelete, onAdd }) => {
  // --- State for new features ---
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [filters, setFilters] = useState({
    categoryId: "",
    mediaType: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // --- Memoized filtering logic ---
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const categoryMatch =
          !filters.categoryId ||
          item.category?.id === parseInt(filters.categoryId);
        const mediaTypeMatch =
          !filters.mediaType || item.mediaType === filters.mediaType;
        const statusMatch =
          !filters.status ||
          (filters.status === "active" ? item.isActive : !item.isActive);
        return categoryMatch && mediaTypeMatch && statusMatch;
      })
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)); // Sort by display order
  }, [items, filters]);

  // --- Memoized pagination logic ---
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // --- Reset to page 1 when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}

      {/* --- Header with Filters and Upload Button --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="border border-green-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="mediaType"
            value={filters.mediaType}
            onChange={handleFilterChange}
            className="border border-green-600  rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Media Types</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-green-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button
          onClick={onAdd}
          className="text-white font-bold !py-2 !px-4 !rounded-lg flex items-center w-full sm:w-auto justify-center"
        >
          <UploadIcon /> Upload New Item
        </Button>
      </div>

      {/* --- Gallery Grid --- */}
      {paginatedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold">No Items Found</h3>
          <p className="mt-2">
            Try adjusting your filters or upload a new item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={setLightboxItem}
            />
          ))}
        </div>
      )}

      {/* --- Pagination Controls --- */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

// --- Gallery Item Card Component ---
const GalleryItemCard: React.FC<{
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (itemId: number) => void;
  onView: (item: GalleryItem) => void;
}> = ({ item, onEdit, onDelete, onView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get proper image URL
  const imageUrl = getImageUrl(
    item.thumbnailUrl || (item.mediaType === "IMAGE" ? item.mediaUrl : "")
  );

  // Debug: Log image URL for troubleshooting
  useEffect(() => {
    console.log(`Item ${item.id} image URL:`, imageUrl);
  }, [item.id, imageUrl]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Media display */}
      <button
        onClick={() => onView(item)}
        className="relative h-52 w-full block bg-gray-900 focus:outline-none"
      >
        {item.mediaType === "IMAGE" ? (
          <>
            <img
              src={imageUrl}
              alt={item.altText || item.title}
              className={`w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60 ${
                imageLoaded ? "" : "hidden"
              }`}
              onLoad={() => {
                console.log(`Image loaded successfully: ${imageUrl}`);
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                console.error(`Failed to load image: ${imageUrl}`);
                setImageError(true);
                setImageLoaded(false);
              }}
            />
            {!imageLoaded && !imageError && (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              </div>
            )}
            {imageError && (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span>Failed to load image</span>
              </div>
            )}
          </>
        ) : (
          <video
            src={getImageUrl(item.mediaUrl)}
            controls
            autoPlay
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Failed to load video in lightbox:", e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
        <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.mediaType === "VIDEO" ? <VideoIcon /> : <ExpandIcon />}
          </div>
        </div>
        {/* Video indicator */}
        {item.mediaType === "VIDEO" && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1.5">
            <VideoIcon />
          </div>
        )}
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {!item.isActive && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Inactive
            </span>
          )}
          {item.isFeatured && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate" title={item.title}>
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 h-10 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4 h-5 overflow-hidden">
          {item.category && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {item.category.name}
            </span>
          )}
          {item.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Order: {item.displayOrder || "N/A"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-green-600 hover:text-green-700"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-red-100 hover:text-red-700"
              title="Delete"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [UNCHANGED] Category Manager and Modal ---

const CategoryManager: React.FC<{
  initialCategories: Category[];
  refreshData: () => void;
}> = ({ initialCategories, refreshData }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [isCatModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // const handleSave = async (categoryData: {
  //   name: string;
  //   slug: string;
  //   description: string;
  // }) => {
  //   const headers = getAuthHeaders();
  //   if (!headers) return;

  //   try {
  //     if (editingCategory) {
  //       await axios.put(
  //         `${apiUrl}/api/admin/gallery/categories/${editingCategory.id}`,
  //         categoryData,
  //         { headers }
  //       );
  //       toast.success("Category updated!");
  //     } else {
  //       await axios.post(
  //         `${apiUrl}/api/admin/gallery/categories`,
  //         categoryData,
  //         { headers }
  //       );
  //       toast.success("Category created!");
  //     }
  //     setCatModalOpen(false);
  //     refreshData();
  //   } catch {
  //     toast.error(`Failed to save category.`);
  //   }
  // };

  // Re-using the interface you already defined
interface CategorySaveData {
  name: string;
  slug: string;
  description?: string;
}

const handleSave = async (categoryData: CategorySaveData) => {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    if (editingCategory) {
      await axios.put(
        `${apiUrl}/api/admin/gallery/categories/${editingCategory.id}`,
        categoryData,
        { headers }
      );
      toast.success("Category updated!");
    } else {
      await axios.post(
        `${apiUrl}/api/admin/gallery/categories`,
        categoryData,
        { headers }
      );
      toast.success("Category created!");
    }
    setCatModalOpen(false);
    refreshData();
  } catch {
    toast.error(`Failed to save category.`);
  }
};

  const handleDelete = async (categoryId: number) => {
    if (
      !window.confirm(
        "Are you sure? Deleting a category will not delete its items."
      )
    )
      return;
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      await axios.delete(
        `${apiUrl}/api/admin/gallery/categories/${categoryId}`,
        { headers }
      );
      toast.success("Category deleted.");
      refreshData();
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Categories</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCatModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon /> Add Category
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between items-center p-2 border rounded-md"
          >
            <span>
              {cat.name} ({cat.slug})
            </span>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setCatModalOpen(true);
                }}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isCatModalOpen && (
        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => setCatModalOpen(false)}
          onSave={handleSave}
          categoryToEdit={editingCategory}
        />
      )}
    </div>
  );
};

interface CategorySaveData {
  name: string;
  slug: string;
  description?: string;
}

const CategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategorySaveData) => void;
  categoryToEdit: Category | null;
}> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
  const [name, setName] = useState(categoryToEdit?.name || "");
  const [slug, setSlug] = useState(categoryToEdit?.slug || "");
  const [description, setDescription] = useState(
    categoryToEdit?.description || ""
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, slug, description });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold">
            {categoryToEdit ? "Edit" : "Add"} Category
          </h3>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Slug (e.g., 'summer-camp')"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          ></textarea>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- [UNCHANGED] Tag Manager and Modal ---
const TagManager: React.FC<{ initialTags: Tag[]; refreshData: () => void }> = ({
  initialTags,
  refreshData,
}) => {
  const [tags, setTags] = useState(initialTags);
  const [isTagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const handleSave = async (tagData: { name: string; slug: string }) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      if (editingTag) {
        await axios.put(
          `${apiUrl}/api/admin/gallery/tags/${editingTag.id}`,
          tagData,
          { headers }
        );
        toast.success("Tag updated!");
      } else {
        await axios.post(`${apiUrl}/api/admin/gallery/tags`, tagData, {
          headers,
        });
        toast.success("Tag created!");
      }
      setTagModalOpen(false);
      refreshData();
    } catch {
      toast.error(`Failed to save tag.`);
    }
  };

  const handleDelete = async (tagId: number) => {
    if (
      !window.confirm(
        "Are you sure? Deleting a tag will remove it from all gallery items."
      )
    )
      return;
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      await axios.delete(`${apiUrl}/api/admin/gallery/tags/${tagId}`, {
        headers,
      });
      toast.success("Tag deleted.");
      refreshData();
    } catch {
      toast.error("Failed to delete tag.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Tags</h2>
        <button
          onClick={() => {
            setEditingTag(null);
            setTagModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon /> Add Tag
        </button>
      </div>
      <ul className="space-y-2">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex justify-between items-center p-2 border rounded-md"
          >
            <span>
              {tag.name} ({tag.slug})
            </span>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingTag(tag);
                  setTagModalOpen(true);
                }}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isTagModalOpen && (
        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setTagModalOpen(false)}
          onSave={handleSave}
          tagToEdit={editingTag}
        />
      )}
    </div>
  );
};

const TagModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategorySaveData) => void;
  tagToEdit: Tag | null;
}> = ({ isOpen, onClose, onSave, tagToEdit }) => {
  const [name, setName] = useState(tagToEdit?.name || "");
  const [slug, setSlug] = useState(tagToEdit?.slug || "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, slug });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold">
            {tagToEdit ? "Edit" : "Add"} Tag
          </h3>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Slug (e.g., 'summer-camp')"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- [SLIGHTLY MODIFIED] Upload/Edit Modal ---
const UploadEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: GalleryItem | null;
  categories: Category[];
  tags: Tag[];
  onSuccess: () => void;
}> = ({ isOpen, onClose, itemToEdit, categories, tags, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    itemToEdit
      ? getImageUrl(itemToEdit.thumbnailUrl || itemToEdit.mediaUrl)
      : null
  );
  const [title, setTitle] = useState(itemToEdit?.title || "");
  const [description, setDescription] = useState(itemToEdit?.description || "");
  const [altText, setAltText] = useState(itemToEdit?.altText || "");
  const [displayOrder, setDisplayOrder] = useState(
    itemToEdit?.displayOrder || 0
  );
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">(
    itemToEdit?.mediaType || "IMAGE"
  );
  const [categoryId, setCategoryId] = useState<string>(
    itemToEdit?.category?.id.toString() || ""
  );
  const [selectedTags, setSelectedTags] = useState<Set<number>>(
    new Set(itemToEdit?.tags?.map((t) => t.id) || [])
  );
  const [isActive, setIsActive] = useState(itemToEdit?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(itemToEdit?.isFeatured ?? false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMediaType(selectedFile.type.startsWith("video") ? "VIDEO" : "IMAGE");
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleTagChange = (tagId: number) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) newSet.delete(tagId);
      else newSet.add(tagId);
      return newSet;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemToEdit && !file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    const formData = new FormData();
    const details = {
      title,
      description,
      altText,
      displayOrder,
      mediaType,
      categoryId: categoryId ? parseInt(categoryId) : null,
      tagIds: Array.from(selectedTags),
      isActive,
      isFeatured,
    };

    // Note: For PUT requests, many backends prefer application/json.
    // If your backend expects multipart/form-data for updates with files, this logic is correct.
    // If it expects JSON for metadata-only updates, a different approach is needed.
    // This code assumes the PUT endpoint can handle metadata-only updates via JSON.

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (itemToEdit) {
        // For editing, we assume metadata is updated as JSON. File updates would need a separate mechanism.
        await axios.put(
          `${apiUrl}/api/admin/gallery/${itemToEdit.id}`,
          details,
          { headers }
        );
        toast.success("Item updated successfully.");
      } else if (file) {
        formData.append(
          "details",
          new Blob([JSON.stringify(details)], { type: "application/json" })
        );
        formData.append("file", file);

        // const config = {
        //   headers: { ...headers, "Content-Type": "multipart/form-data" },
        //   onUploadProgress: (progressEvent: any) => {
        //     const percentCompleted = Math.round(
        //       (progressEvent.loaded * 100) / progressEvent.total
        //     );
        //     setUploadProgress(percentCompleted);
        //   },
        // };
        const config = {
  headers: { ...headers, "Content-Type": "multipart/form-data" },
  onUploadProgress: (progressEvent: import('axios').AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percentCompleted);
    } else {
     
      setUploadProgress(0);
    }
  },
};
        await axios.post(`${apiUrl}/api/admin/gallery`, formData, config);
        toast.success("Item uploaded successfully.");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(`Failed to ${itemToEdit ? "update" : "upload"} item.`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">
            {itemToEdit ? "Edit" : "Upload New"} Gallery Item
          </h2>

          <div>
            <label className="block text-sm font-medium">Media File</label>
            {!itemToEdit && (
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="mt-1 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            )}
            {itemToEdit && (
              <p className="text-sm text-gray-500 mt-1">
                File upload is not available when editing. To change the file,
                please delete this item and upload a new one.
              </p>
            )}
            {preview && (
              <div className="mt-2">
                {mediaType === "VIDEO" ? (
                  <video
                    src={preview}
                    controls
                    className="rounded-md max-h-48"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-md max-h-48"
                  />
                )}
              </div>
            )}
          </div>

          {isUploading && (
            <div>
              <label className="block text-sm font-medium">Uploading...</label>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-right text-gray-600 mt-1">
                {uploadProgress}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Media Type</label>
              <select
                value={mediaType}
                // onChange={(e) => setMediaType(e.target.value as any)}
                onChange={(e) => setMediaType(e.target.value as "IMAGE" | "VIDEO")}
                className="w-full p-2 border rounded-md bg-gray-100"
                disabled
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Alt Text (for SEO)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- No Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2 p-2 border rounded-md max-h-28 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagChange(tag.id)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedTags.has(tag.id)
                      ? "bg-green-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2 pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm">
                  Active (Visible on public site)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm">
                  Featured (Highlight on homepage)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 flex items-center justify-center min-w-[120px]"
            >
              {isUploading ? `Uploading...` : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGalleryPage;
