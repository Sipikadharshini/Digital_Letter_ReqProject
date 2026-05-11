import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSignature, CheckCircle, XCircle, Eye, FileText, Clock, Upload, PenTool } from 'lucide-react';
import DocumentPreview from '../components/DocumentPreview';

const API = import.meta.env.VITE_API_URL;

const HodDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [previewRequest, setPreviewRequest] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [profile, setProfile] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/profile`);
      setProfile(data);
    } catch (error) {
       console.error("Profile fetch error", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const [reqsRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/requests/hod`),
        axios.get(`${API}/api/requests/hod/stats`)
      ]);
      setRequests(reqsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRequests();
  }, []);

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('signature', file);
    setUploadingSignature(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/users/signature`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      alert('Signature uploaded successfully!');
      fetchProfile(); 
    } catch (error) {
      alert('Failed to upload signature: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve request and finalize with HOD signature?')) return;
    try {
      await axios.post(`${API}/api/requests/${id}/approve/hod`);
      alert('Request approved successfully');
      fetchRequests();
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    if (!reason) return alert('Please provide a reason for rejection');
    try {
      await axios.post(`${API}/api/requests/${id}/reject/hod`, { reason });
      alert('Request rejected');
      setRejectingId(null);
      setReason('');
      fetchRequests();
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">HOD Dashboard</h2>
          <p className="text-gray-500 mt-1">Review requests approved by Faculty Advisors</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl flex items-center font-bold">
          <FileSignature className="mr-2" size={20} />
          {requests.length} Pending
        </div>
      </div>

      {/* Signature Setup Missing Banner */}
      {profile && !profile.signatureUrl && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <PenTool className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-bold text-yellow-800">Action Required: Setup Your Digital Signature</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Before you can approve documents, you must safely upload a picture of your signature to be auto-embedded on approved PDFs.</p>
              </div>
              <div className="mt-4">
                <label className={`relative cursor-pointer inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${uploadingSignature ? 'opacity-70 pointer-events-none' : ''}`}>
                  <Upload size={16} />
                  <span>{uploadingSignature ? 'Uploading...' : 'Upload Signature Picture (PNG/JPG)'}</span>
                  <input type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleSignatureUpload} disabled={uploadingSignature} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Configured Banner */}
      {profile?.signatureUrl && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">Signature Configured</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>Your signature will be automatically embedded when you approve documents.</p>
              </div>
              <div className="mt-3 flex items-center space-x-4">
                <div className="bg-white border border-green-200 rounded p-2 h-16 w-32 flex items-center justify-center overflow-hidden">
                  <img src={`${API}/${profile.signatureUrl}`} alt="Your Signature" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
            <label className={`relative cursor-pointer inline-flex items-center space-x-2 bg-white border border-green-300 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${uploadingSignature ? 'opacity-70 pointer-events-none' : ''}`}>
              <Upload size={16} />
              <span>{uploadingSignature ? 'Updating...' : 'Update Signature'}</span>
              <input type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleSignatureUpload} disabled={uploadingSignature} />
            </label>
          </div>
        </div>
      )}

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Addressed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-300 mb-4" />
            <p className="text-xl font-bold text-gray-800">All caught up!</p>
            <p className="text-gray-500 mt-2">No pending items for HOD review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Request Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.student.name}</div>
                      <div className="text-xs text-gray-500">{req.student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {req.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setPreviewRequest(req)}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={16} className="mr-1.5" /> Preview
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rejectingId === req.id ? (
                        <div className="flex items-center justify-end space-x-2 animate-in slide-in-from-right-2">
                          <input 
                            type="text" 
                            placeholder="Reason for rejection..." 
                            value={reason} onChange={e => setReason(e.target.value)}
                            className="px-3 py-1.5 border border-red-200 focus:border-red-500 rounded-lg text-sm outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleReject(req.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Confirm</button>
                          <button onClick={() => {setRejectingId(null); setReason('');}} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleApprove(req.id)}
                            disabled={!profile?.signatureUrl}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                              ${!profile?.signatureUrl ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                          >
                            <CheckCircle size={16} className="mr-1.5" /> Approve
                          </button>
                          <button 
                            onClick={() => setRejectingId(req.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                          >
                            <XCircle size={16} className="mr-1.5" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewRequest && (
        <DocumentPreview 
          request={previewRequest} 
          onClose={() => setPreviewRequest(null)} 
        />
      )}
    </div>
  );
};

export default HodDashboard;
