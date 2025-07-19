'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';


const discountTypes = ['PERCENTAGE', 'FIXED_AMOUNT'];
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
interface Sport {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  sportId: number;
}

interface Package {
  id: number;
  name: string;
  courseId: number;
}

export default function CreateCoupon() {
  const [couponCode, setCouponCode] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [existingCodes] = useState<string[]>([]);

  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [usesPerUser, setUsesPerUser] = useState(1);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [sports, setSports] = useState<Sport[]>([]);
const [courses, setCourses] = useState<Course[]>([]);
const [packages, setPackages] = useState<Package[]>([]);

  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);


  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};
  useEffect(() => {
    const fetchData = async () => {
          const headers = getAuthHeaders();
    if (!headers) return;
       try {
        const [sportsRes, coursesRes, packagesRes] = await Promise.all([
                axios.get(`${apiUrl}/api/public_api/sports`),
                axios.get(`${apiUrl}/api/admin/courses`, {headers}),
                axios.get(`${apiUrl}/api/admin/packages`, {headers})
        ]);

        const sportsData = sportsRes.data;
        const courseData = coursesRes.data.data;
        const packagesData =packagesRes.data;

        setSports(sportsData);
        setCourses(courseData);
        setPackages(packagesData);
      } catch (err) {
        toast.error('Failed to fetch data');
        console.error(err)
      }
    };

    fetchData();
/*
    const response=fetch(`${apiUrl}/api/coupons/codes/check`)
      .then(res => res.json())
      .then(data => setExistingCodes(data))
      .catch(() => toast.error('Failed to load existing codes'));
      */
  }, []);


  const generateCode = () => {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix.toUpperCase()}${suffix}`;
    setCouponCode(generated);
  };

  const handleCouponCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCouponCode(formatted);
    if (existingCodes.includes(formatted)) {
      toast.error('This coupon code already exists.');
    }
  };

  const handleSportChange = (sportId: number) => {
    const alreadySelected = selectedSports.includes(sportId);
    const updatedSports = alreadySelected
      ? selectedSports.filter(id => id !== sportId)
      : [...selectedSports, sportId];

    setSelectedSports(updatedSports);

    // Automatically update courses for this sport
    const courseIdsForSport = courses.filter(c => c.sportId === sportId).map(c => c.id);
    if (!alreadySelected) {
      setSelectedCourses(prev => [...new Set([...prev, ...courseIdsForSport])]);
    } else {
      setSelectedCourses(prev => prev.filter(id => !courseIdsForSport.includes(id)));
    }
  };

  const handleCourseChange = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePackageChange = (packageId: number) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!autoGenerate && existingCodes.includes(couponCode)) {
      toast.error('Duplicate coupon code.');
      return;
    }

    const payload = {
      couponCode,
      description,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      maxUses,
      usesPerUser,
      minPurchaseAmount,
      isActive,
      currentTotalUses: 0,
      applicableSportIds: selectedSports,
applicableCourseIds: selectedCourses,
applicablePackageIds: selectedPackages
    };

    try {
    const headers = getAuthHeaders();
    if (!headers) return;
      const res = await axios.post(`${apiUrl}/api/admin/coupons`, payload, { headers });
      console.log("response is", res);
         toast.success('Coupon created successfully!');
      
    } catch {
      toast.error('Failed to create coupon or coupen code my exist');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold">Create New Coupon</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="font-medium">Coupon Code</label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => handleCouponCodeChange(e.target.value)}
              className="border p-2 rounded w-full"
              disabled={autoGenerate}
              placeholder="Enter coupon code manually"
              required
            />
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => {
                  setAutoGenerate(e.target.checked);
                  if (!e.target.checked) setCouponCode('');
                }}
              />
              Auto-generate
            </label>
          </div>
        </div>

        {autoGenerate && (
          <div className="flex gap-4 items-center">
            <input
              type="text"
              maxLength={10}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              placeholder="Enter prefix (e.g. SAVE)"
              className="border p-2 rounded w-1/2"
            />
            <button
              type="button"
              onClick={generateCode}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Generate
            </button>
          </div>
        )}

        <div>
          <label className="font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border w-full p-2 rounded"
            placeholder="Optional description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {discountTypes.map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium">Discount Value</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="e.g., 10 for 10%"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Valid From</label>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="font-medium">Valid Until</label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium">Max Uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="Max usage limit"
            />
          </div>
          <div>
            <label className="font-medium">Uses Per User</label>
            <input
              type="number"
              value={usesPerUser}
              onChange={(e) => setUsesPerUser(Number(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="e.g., 1"
            />
          </div>
          <div>
            <label className="font-medium">Min Purchase Amount</label>
            <input
              type="number"
              value={minPurchaseAmount}
              onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="e.g., 100.00"
            />
          </div>
        </div>

        <label className="flex gap-2 font-medium items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>

        {/* Sport/Course Section */}
        <div className="bg-gray-50 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Sports & Courses</h2>
          {sports.map((sport) => (
            <div key={sport.id} className="mb-2">
              <label className="font-semibold flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSports.includes(sport.id)}
                  onChange={() => handleSportChange(sport.id)}
                />
                {sport.name}
              </label>
              <div className="ml-6 pl-4 border-l">
                {courses
                  .filter(c => c.sportId === sport.id)
                  .map(course => (
                    <label key={course.id} className="block">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseChange(course.id)}
                      />{' '}
                      {course.name}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Package Section */}
        <div className="bg-gray-50 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Packages</h2>
          {packages.map(pkg => (
            <label key={pkg.id} className="block">
              <input
                type="checkbox"
                checked={selectedPackages.includes(pkg.id)}
                onChange={() => handlePackageChange(pkg.id)}
              />{' '}
              {pkg.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Coupon
        </button>
      </form>
    </div>
  );
}
