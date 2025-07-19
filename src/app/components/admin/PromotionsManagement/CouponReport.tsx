'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

type Coupon = {
  id: number;
  couponCode: string;
  autoGenerateCode: boolean;
  codePrefix: string | null;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usesPerUser: number;
  minPurchaseAmount: number;
  currentTotalUses: number;
  applicableSportIds: number[];
  applicableCourseIds: number[];
  applicablePackageIds: number[];
  active: boolean;
};

type Sport = {
  id: number;
  name: string;
};

type Course = {
  id: number;
  name: string;
  sportId: number;
};

type Package = {
  id: number;
  name: string;
};

const discountTypes = ['PERCENTAGE', 'FIXED_AMOUNT'] as const;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export default function CouponReport() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);


  // --- API Helper ---
const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};
  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
         const headers = getAuthHeaders();
    if (!headers) return;
      try {
        setLoading(true);
        const [
          couponsRes,
          sportsRes,
          coursesRes,
          packagesRes,
          //codesRes
        ] = await Promise.all([
          axios.get(`${apiUrl}/api/admin/coupons`, {headers}),
          axios.get(`${apiUrl}/api/public_api/sports`),
          axios.get(`${apiUrl}/api/admin/courses`, {headers}),
          axios.get(`${apiUrl}/api/admin/packages`, {headers}),
          //axios.get(`${apiUrl}/api/admin/coupons/check`)
        ]);

        setCoupons(couponsRes.data);
        setSports(sportsRes.data);
        setCourses(coursesRes.data.data || []);
        setPackages(packagesRes.data);
        //setExistingCodes(codesRes.data);
        console.log("data is:--",couponsRes.data, sportsRes.data, coursesRes.data.data, packagesRes.data);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteCoupon = async (couponId: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
      const headers = getAuthHeaders();
    if (!headers) return;
    try {
      await axios.delete(`${apiUrl}/api/admin/coupons/${couponId}`, {headers});
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast.success('Coupon deleted successfully');
    } catch (error) {
      toast.error('Failed to delete coupon');
      console.error('Delete error:', error);
    }
  };

  const fetchCouponDetails = async (couponId: number) => {
      const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await axios.get(`${apiUrl}/api/admin/coupons/${couponId}`, {headers});
      setSelectedCoupon(res.data[0]);
    } catch (error) {
      toast.error('Failed to fetch coupon details');
      console.error('Fetch details error:', error);
    }
  };

  const handleEdit = async (couponId: number) => {
      const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await axios.get(`${apiUrl}/api/admin/coupons/${couponId}`, {headers});
      setEditingCoupon(res.data[0]);
    } catch (error) {
      toast.error('Failed to load coupon for editing');
      console.error('Edit error:', error);
    }
  };

  const handleEditChange = (field: keyof Coupon, value: Coupon[keyof Coupon]) => {
    setEditingCoupon(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSportChange = (sportId: number) => {
    if (!editingCoupon) return;

    const alreadySelected = editingCoupon.applicableSportIds.includes(sportId);
    const updatedSports = alreadySelected
      ? editingCoupon.applicableSportIds.filter(id => id !== sportId)
      : [...editingCoupon.applicableSportIds, sportId];

    setEditingCoupon({
      ...editingCoupon,
      applicableSportIds: updatedSports
    });

    // Update related courses
    const courseIdsForSport = courses.filter(c => c.sportId === sportId).map(c => c.id);
    if (!alreadySelected) {
      setEditingCoupon(prev => prev ? {
        ...prev,
        applicableCourseIds: [...new Set([...prev.applicableCourseIds, ...courseIdsForSport])]
      } : null);
    } else {
      setEditingCoupon(prev => prev ? {
        ...prev,
        applicableCourseIds: prev.applicableCourseIds.filter(id => !courseIdsForSport.includes(id))
      } : null);
    }
  };

  const handleCourseChange = (courseId: number) => {
    setEditingCoupon(prev => prev ? {
      ...prev,
      applicableCourseIds: prev.applicableCourseIds.includes(courseId)
        ? prev.applicableCourseIds.filter(id => id !== courseId)
        : [...prev.applicableCourseIds, courseId]
    } : null);
  };

  const handlePackageChange = (packageId: number) => {
    setEditingCoupon(prev => prev ? {
      ...prev,
      applicablePackageIds: prev.applicablePackageIds.includes(packageId)
        ? prev.applicablePackageIds.filter(id => id !== packageId)
        : [...prev.applicablePackageIds, packageId]
    } : null);
  };

  const handleEditSubmit = async () => {
      const headers = getAuthHeaders();
    if (!headers) return;
    if (!editingCoupon) return;
    
    try {
      await axios.put(`${apiUrl}/api/admin/coupons/${editingCoupon.id}`, editingCoupon, {headers});
      toast.success('Coupon updated successfully');
      setEditingCoupon(null);
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? editingCoupon : c));
    } catch (error) {
      toast.error('Failed to update coupon');
      console.error('Update error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Coupon Management</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{coupon.couponCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 max-w-xs truncate">{coupon.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{coupon.discountType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(coupon.validFrom)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => fetchCouponDetails(coupon.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEdit(coupon.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCoupon && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Coupon Details</h2>
                  <button 
                    onClick={() => setSelectedCoupon(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <DetailItem label="Code" value={selectedCoupon.couponCode} />
                    <DetailItem label="Description" value={selectedCoupon.description} />
                    <DetailItem label="Discount Type" value={selectedCoupon.discountType} />
                    <DetailItem 
                      label="Discount Value" 
                      value={selectedCoupon.discountType === 'PERCENTAGE' 
                        ? `${selectedCoupon.discountValue}%` 
                        : `$${selectedCoupon.discountValue.toFixed(2)}`} 
                    />
                    <DetailItem label="Min Purchase" value={`$${selectedCoupon.minPurchaseAmount.toFixed(2)}`} />
                  </div>
                  <div className="space-y-2">
                    <DetailItem label="Uses" value={`${selectedCoupon.currentTotalUses} / ${selectedCoupon.maxUses}`} />
                    <DetailItem label="Uses Per User" value={selectedCoupon.usesPerUser} />
                    <DetailItem label="Valid From" value={formatDate(selectedCoupon.validFrom)} />
                    <DetailItem label="Valid Until" value={formatDate(selectedCoupon.validUntil)} />
                    <DetailItem label="Status" value={selectedCoupon.active ? 'Active' : 'Inactive'} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-medium text-gray-700 mb-2">Applicable Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Sports</h4>
                        <div className="mt-1 space-y-1">
                          {selectedCoupon.applicableSportIds?.length ? (
                            selectedCoupon.applicableSportIds.map(id => (
                              <div key={id} className="text-sm text-gray-700">
                                {sports.find(s => s.id === id)?.name || `ID: ${id}`}
                              </div>
                            ))
                          ) : <div className="text-sm text-gray-500">None</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Courses</h4>
                        <div className="mt-1 space-y-1">
                          {selectedCoupon.applicableCourseIds?.length ? (
                            selectedCoupon.applicableCourseIds.map(id => (
                              <div key={id} className="text-sm text-gray-700">
                                {courses.find(c => c.id === id)?.name || `ID: ${id}`}
                              </div>
                            ))
                          ) : <div className="text-sm text-gray-500">None</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Packages</h4>
                        <div className="mt-1 space-y-1">
                          {selectedCoupon.applicablePackageIds?.length ? (
                            selectedCoupon.applicablePackageIds.map(id => (
                              <div key={id} className="text-sm text-gray-700">
                                {packages.find(p => p.id === id)?.name || `ID: ${id}`}
                              </div>
                            ))
                          ) : <div className="text-sm text-gray-500">None</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingCoupon && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">Edit Coupon</h2>
                      <button 
                        onClick={() => setEditingCoupon(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                          <input
                            type="text"
                            value={editingCoupon.couponCode}
                            onChange={(e) => handleEditChange('couponCode', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={editingCoupon.description}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                          <select
                            value={editingCoupon.discountType}
                            onChange={(e) => handleEditChange('discountType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {discountTypes.map(type => (
                              <option key={type} value={type}>{type.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount Value
                            {editingCoupon.discountType === 'PERCENTAGE' ? ' (%)' : ' ($)'}
                          </label>
                          <input
                            type="number"
                            value={editingCoupon.discountValue}
                            onChange={(e) => handleEditChange('discountValue', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="0"
                            step={editingCoupon.discountType === 'PERCENTAGE' ? "1" : "0.01"}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                          <input
                            type="datetime-local"
                            value={formatDateTimeLocal(editingCoupon.validFrom)}
                            onChange={(e) => handleEditChange('validFrom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                          <input
                            type="datetime-local"
                            value={formatDateTimeLocal(editingCoupon.validUntil)}
                            onChange={(e) => handleEditChange('validUntil', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                          <input
                            type="number"
                            value={editingCoupon.maxUses}
                            onChange={(e) => handleEditChange('maxUses', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Uses Per User</label>
                          <input
                            type="number"
                            value={editingCoupon.usesPerUser}
                            onChange={(e) => handleEditChange('usesPerUser', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase ($)</label>
                          <input
                            type="number"
                            value={editingCoupon.minPurchaseAmount}
                            onChange={(e) => handleEditChange('minPurchaseAmount', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Auto Generate Code</label>
                          <select
                            value={editingCoupon.autoGenerateCode ? 'true' : 'false'}
                            onChange={(e) => handleEditChange('autoGenerateCode', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code Prefix</label>
                          <input
                            type="text"
                            value={editingCoupon.codePrefix || ''}
                            onChange={(e) => handleEditChange('codePrefix', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={!editingCoupon.autoGenerateCode}
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingCoupon.active}
                          onChange={(e) => handleEditChange('active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Active Coupon</label>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Applicable Items</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Sports</h4>
                            <div className="space-y-2">
                              {sports.map(sport => (
                                <div key={sport.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={editingCoupon.applicableSportIds.includes(sport.id)}
                                    onChange={() => handleSportChange(sport.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 text-sm text-gray-700">{sport.name}</label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Courses</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {sports.map(sport => {
                                const sportCourses = courses.filter(c => c.sportId === sport.id);
                                if (sportCourses.length === 0) return null;
                                
                                return (
                                  <div key={sport.id} className="space-y-2">
                                    <h5 className="text-xs font-medium text-gray-500">{sport.name}</h5>
                                    {sportCourses.map(course => (
                                      <div key={course.id} className="flex items-center ml-2">
                                        <input
                                          type="checkbox"
                                          checked={editingCoupon.applicableCourseIds.includes(course.id)}
                                          onChange={() => handleCourseChange(course.id)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">{course.name}</label>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Packages</h4>
                            <div className="space-y-2">
                              {packages.map(pkg => (
                                <div key={pkg.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={editingCoupon.applicablePackageIds.includes(pkg.id)}
                                    onChange={() => handlePackageChange(pkg.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 text-sm text-gray-700">{pkg.name}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingCoupon(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleEditSubmit}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}