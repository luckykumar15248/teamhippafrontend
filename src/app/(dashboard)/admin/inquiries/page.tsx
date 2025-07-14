'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import router from 'next/router';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const InquiryStatus = {
  NEW: 'NEW',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD:'ON_HOLD',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
};

interface Inquiry {
  id: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  message: string;
  sportName: string;
  courseName: string;
  status: string;
  createdAt: string;
  referralSource: string;
  remarks?: string;
}

interface Sport {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

const AdminEnquiriesPage = () => {
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

 
  useEffect(() => {
    fetchInquiries();
    fetchSports();
    fetchCourses();
  }, []);



  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${apiUrl}api/admin/inquiries`);
      setAllInquiries(response.data);
    } catch (error) {
      toast.error('Failed to fetch inquiries.');
    }
  };

  const fetchSports = async () => {
    try {
      const response = await axios.get(`${apiUrl}api/public_api/sports`);
      setSports(response.data);
    } catch (error) {
      toast.error('Failed to fetch sports.');
    }
  };

  const fetchCourses = async () => {
    try {
     const response = await axios.get(`${apiUrl}api/public_api/courses`);
    setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    }
  };

   /* const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    }*/

  useEffect(() => {
//const token = getAuthToken();
           setCurrentPage(1);
  }, [statusFilter, dateFromFilter, dateToFilter, sportFilter, courseFilter, search]);

  const filteredInquiries = useMemo(() => {
  let data = allInquiries
    .filter(inquiry => statusFilter ? inquiry.status === statusFilter : true)
    .filter(inquiry => dateFromFilter ? new Date(inquiry.createdAt) >= new Date(dateFromFilter) : true)
    .filter(inquiry => dateToFilter ? new Date(inquiry.createdAt) <= new Date(dateToFilter) : true)
    .filter(inquiry => sportFilter ? inquiry.sportName?.toLowerCase() === sportFilter.toLowerCase() : true)
    .filter(inquiry => courseFilter ? inquiry.courseName?.toLowerCase() === courseFilter.toLowerCase() : true)
    .filter(inquiry => {
      const val = `${inquiry.visitorName} ${inquiry.visitorEmail} ${inquiry.visitorPhone}`.toLowerCase();
      return val.includes(search.toLowerCase());
    });

  if (sortKey) {
    data = [...data].sort((a, b) => {
      // Safely get values with fallbacks for undefined
      const valA = (a[sortKey as keyof Inquiry]?.toString() || '').toLowerCase();
      const valB = (b[sortKey as keyof Inquiry]?.toString() || '').toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  return data;
}, [allInquiries, statusFilter, dateFromFilter, dateToFilter, sportFilter, courseFilter, search, sortKey, sortAsc]);

  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInquiries, currentPage]);

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Sport', 'Course', 'Message', 'Status', 'Date'];
    const rows = filteredInquiries.map(inq => [
      inq.visitorName,
      inq.visitorEmail,
      inq.visitorPhone,
      inq.sportName,
      inq.courseName,
      inq.message,
      inq.status,
      new Date(inq.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(item => `"${(item ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'inquiries.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const updateStatus = async (ids: number[], status: string, remarks?: string) => {
    try {
      await axios.post(`${apiUrl}api/admin/inquiries/bulk-status`, { 
        ids, 
        status,
        remarks: remarks 
      });
      toast.success('Status updated successfully.');
      fetchInquiries();
      setSelectedIds([]);
      if (ids.includes(selectedInquiry?.id || 0)) {
        setSelectedInquiry(prev => prev ? {...prev, status, adminRemarks: remarks || prev.remarks} : null);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const deleteInquiries = async (ids: number[]) => {
    try {
      await axios.post(`${apiUrl}api/admin/inquiries/delete`, { ids });
      toast.success('Deleted successfully.');
      fetchInquiries();
      setSelectedIds([]);
      if (ids.includes(selectedInquiry?.id || 0)) {
        setViewModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  const openViewModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminRemarks(inquiry.remarks || '');
    setViewModalOpen(true);
  };

  const openEmailModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setEmailSubject(`Response to your inquiry about ${inquiry.sportName || inquiry.courseName || 'our services'}`);
    setEmailBody(`Dear ${inquiry.visitorName},\n\nThank you for reaching out to us regarding ${inquiry.sportName || inquiry.courseName || 'our services'}.\n\n`);
    setEmailModalOpen(true);
  };

  const sendEmail = async () => {
    if (!selectedInquiry) {
      toast.error('No inquiry selected.');
      return;
    }
    try {
      await axios.post(`${apiUrl}api/admin/inquiries/reply`, {
        inquiryId: selectedInquiry.id,
        toEmail: selectedInquiry.visitorEmail,
        subject: emailSubject,
        body: emailBody,
      });

      //// In a real app, you would send this to your backend to handle the email sending
      //window.location.href = `mailto:${selectedInquiry.visitorEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      toast.success('Email prepared successfully. Please send it from your email client.');
      setEmailModalOpen(false);
    } catch (err) {
      toast.error('Failed to prepare email.');
    }
  };

  const saveAdminRemarks = () => {
    if (selectedInquiry) {
      updateStatus([selectedInquiry.id], selectedInquiry.status, adminRemarks);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Inquiries Management</h2>

      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          placeholder="Search by name, email or phone"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleExport} className="px-4 py-2 bg-blue-500 text-white rounded-md">Export Excel</button>
        <button onClick={() => updateStatus(selectedIds, 'Resolved')} className="px-4 py-2 bg-green-600 text-white rounded-md">Bulk Resolved</button>
        <button onClick={() => updateStatus(selectedIds, 'Closed')} className="px-4 py-2 bg-yellow-600 text-white rounded-md">Bulk Closed</button>
        <button onClick={() => deleteInquiries(selectedIds)} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete Selected</button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 items-center mb-6 border border-gray-200">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-48 px-3 py-2 border rounded-md">
          <option value="">All Statuses</option>
          {Object.values(InquiryStatus).map(status => <option key={status}>{status}</option>)}
        </select>

        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="w-full sm:w-48 px-3 py-2 border rounded-md">
          <option value="">All Sports</option>
          {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>

        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full sm:w-48 px-3 py-2 border rounded-md">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="px-3 py-2 border rounded-md" />
        <input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="px-3 py-2 border rounded-md" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left"><input type="checkbox" checked={selectedIds.length === paginatedInquiries.length} onChange={() => {
                if (selectedIds.length === paginatedInquiries.length) setSelectedIds([]);
                else setSelectedIds(paginatedInquiries.map(i => i.id));
              }} /></th>
              {['visitorName', 'visitorEmail', 'visitorPhone', 'sportName', 'courseName', 'status', 'createdAt'].map(key => (
                <th key={key} className="p-2 text-left cursor-pointer" onClick={() => {
                  setSortKey(key);
                  setSortAsc(prev => sortKey === key ? !prev : true);
                }}>{key.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInquiries.map(inq => (
              <tr key={inq.id} className="border-t">
                <td className="p-2"><input type="checkbox" checked={selectedIds.includes(inq.id)} onChange={() => toggleSelect(inq.id)} /></td>
                <td className="p-2">{inq.visitorName}</td>
                <td className="p-2">{inq.visitorEmail}</td>
                <td className="p-2">{inq.visitorPhone}</td>
                <td className="p-2">{inq.sportName}</td>
                <td className="p-2">{inq.courseName}</td>
                <td className="p-2">
                  <select value={inq.status} onChange={e => updateStatus([inq.id], e.target.value)} className="border px-1 py-1 text-sm rounded">
                    {Object.values(InquiryStatus).map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-2">{new Date(inq.createdAt).toLocaleDateString()}</td>
                <td className="p-2 flex gap-2">
                  <button 
                    onClick={() => openViewModal(inq)} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => openEmailModal(inq)} 
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                  >
                    Email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* View Inquiry Modal */}
      {viewModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Inquiry Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.visitorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.visitorEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.visitorPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sport</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.sportName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.courseName || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedInquiry.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={selectedInquiry.status} 
                  onChange={(e) => {
                    setSelectedInquiry({...selectedInquiry, status: e.target.value});
                    updateStatus([selectedInquiry.id], e.target.value, adminRemarks);
                  }} 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {Object.values(InquiryStatus).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Remarks</label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                />
                <button
                  onClick={saveAdminRemarks}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Remarks
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => deleteInquiries([selectedInquiry.id])}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Inquiry
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Send Email Response</h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">To</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.visitorEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From</label>
                  <p className="mt-1 text-sm text-gray-900">Your Admin Email</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={8}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiriesPage;