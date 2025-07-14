'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Sport = {
  id: number;
  name: string;
  isActive: boolean;
  description?: string;
  courseCount: number;
};

const ITEMS_PER_PAGE = 5;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export default function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const res = await axios.get<Sport[]>(`${apiUrl}api/admin/sports`);
      setSports(res.data);
    } catch {
      alert('Failed to load sports');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sport?')) return;
    await axios.delete(`${apiUrl}api/admin/sports/${id}`);
    fetchSports();
  };

  const openModal = (sport?: Sport) => {
    if (sport) {
      setEditingSport(sport);
      setFormData({
        name: sport.name,
        description: sport.description || '',
        isActive: sport.isActive,
      });
    } else {
      setEditingSport(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return alert('Sport name required');
    const payload = {
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
    };

    if (editingSport) {
      await axios.put(`${apiUrl}api/admin/sports/${editingSport.id}`, payload);
    } else {
      await axios.post(`${apiUrl}api/admin/sports`, payload);
    }

    fetchSports();
    setIsModalOpen(false);
  };

  const filteredSports = sports.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSports.length / ITEMS_PER_PAGE);
  const currentItems = filteredSports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sports Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Add Sport
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-sm text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Courses</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {currentItems.map((sport) => (
              <tr key={sport.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">{sport.name}</td>
                <td className="px-6 py-4">{sport.courseCount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      sport.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sport.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openModal(sport)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(sport.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-4 py-2 text-sm rounded-md ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingSport ? 'Edit Sport' : 'Add Sport'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: true })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: false })}
                  />
                  Inactive
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSport ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
