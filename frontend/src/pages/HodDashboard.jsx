import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/HodDashboard.css'; // Import the new CSS file
import { FileSignature, CheckCircle, XCircle, Eye, FileText, Clock, Upload, PenTool } from 'lucide-react';
import DocumentPreview from '../components/DocumentPreview';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const HodDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [previewRequest, setPreviewRequest] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [profile, setProfile] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/profile`);
      setProfileError(null); // Clear any previous error
      setProfile(data);
    } catch (error) {
      console.error("Profile fetch error", error);
      setProfile(null);
      setProfileError(error.response?.data?.message || error.message || 'Failed to load profile');
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
    if (user) {
      setProfile(user);
    }
    fetchProfile();
    fetchRequests();
  }, [user]);

  const handleChooseSignature = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleSignatureFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid signature image.');
      setSignatureFile(null);
      return;
    }
    setSignatureFile(file);
    setUploadError(null);
  };

  const handleSaveSignature = async () => {
    if (!signatureFile) {
      return alert('Please upload a signature image first.');
    }

    setUploadError(null);
    setUploadingSignature(true);

    const formData = new FormData();
    formData.append('signature', signatureFile, signatureFile.name);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/users/signature`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 60000,
      });
      alert('Signature saved successfully!');
      setSignatureFile(null);
      setUploadError(null);
      if (refreshProfile) {
        const updatedProfile = await refreshProfile();
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      } else {
        fetchProfile();
      }
    } catch (error) {
      const message = error.response?.data?.message
        || (error.code === 'ECONNABORTED' || error.message?.includes('timeout') ? 'Signature upload timed out. Check your network and try again.' : null)
        || (error.message?.includes('Network Error') ? 'Network error. Check your connection and try again.' : null)
        || 'Failed to save signature';
      console.error('Signature upload error', error);
      setUploadError(message);
      alert('Failed to save signature: ' + message);
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
    <div className="hod-dashboard-container animate-in fade-in duration-500">
      <div className="hod-dashboard-header-card">
        <div className="hod-dashboard-header-content">
          <h2 className="hod-dashboard-title">HOD Dashboard</h2>
          <p className="text-gray-500 mt-1">Review requests approved by Faculty Advisors</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl flex items-center font-bold">
          <FileSignature className="mr-2" size={20} />
          {requests.length} Pending
        </div>
      </div>

      {/* Profile Fetch Error Banner */}
      {profileError && (
        <div className="hod-dashboard-banner hod-dashboard-banner-error animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="hod-dashboard-banner-content">
            <div className="hod-dashboard-banner-text">Error loading profile: {profileError}</div>
            <button onClick={() => setProfileError(null)} className="hod-dashboard-banner-dismiss-button">Dismiss</button>
          </div>
        </div>
      )}
      {uploadError && (
        <div className="hod-dashboard-banner hod-dashboard-banner-error animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="hod-dashboard-banner-content">
            <div className="hod-dashboard-banner-text">{uploadError}</div>
            <button onClick={() => setUploadError(null)} className="hod-dashboard-banner-dismiss-button">Dismiss</button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSignatureFileChange}
      />

      {/* Signature Setup Missing Banner */}
      {profile && !profile.signatureUrl && (
        <div className="hod-dashboard-banner hod-dashboard-banner-warning animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="hod-dashboard-banner-content-with-icon">
            <div className="hod-dashboard-banner-icon-wrapper">
              <PenTool className="hod-dashboard-banner-icon hod-dashboard-banner-icon-warning" />
            </div>
            <div className="hod-dashboard-banner-text-content">
              <h3 className="hod-dashboard-banner-title-warning">Action Required: Upload Your Signature</h3>
              <div className="hod-dashboard-banner-description-warning">
                <p>Before you can approve documents, please upload a picture of your signature.</p>
              </div>
              <div className="hod-dashboard-banner-actions">
                <button
                  onClick={handleChooseSignature}
                  disabled={uploadingSignature}
                  className={`hod-dashboard-button-warning ${uploadingSignature ? 'hod-dashboard-button-disabled' : ''}`}
                >
                  <Upload size={16} className="hod-dashboard-button-icon" />
                  <span>Upload Signature Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Configured Banner */}
      {profile?.signatureUrl && (
        <div className="hod-dashboard-banner hod-dashboard-banner-success animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="hod-dashboard-banner-content-with-icon hod-dashboard-banner-content-responsive">
            <div className="hod-dashboard-banner-icon-wrapper">
              <CheckCircle className="hod-dashboard-banner-icon hod-dashboard-banner-icon-success" />
            </div>
            <div className="hod-dashboard-banner-text-content">
              <h3 className="hod-dashboard-banner-title-success">Signature Configured</h3>
              <div className="hod-dashboard-banner-description-success">
                <p>Your uploaded signature is saved and will be embedded when you approve documents.</p>
              </div>
              <div className="hod-dashboard-signature-preview-wrapper">
                <div className="hod-dashboard-signature-preview">
                  <img src={`${API}/${profile.signatureUrl}`} alt="Your Signature" className="hod-dashboard-signature-image" />
                </div>
              </div>
            </div>
          </div>
          <div className="hod-dashboard-banner-actions-responsive">
            <button
              onClick={handleChooseSignature}
              disabled={uploadingSignature}
              className={`hod-dashboard-button-secondary ${uploadingSignature ? 'hod-dashboard-button-disabled' : ''}`}
            >
              <PenTool size={16} className="hod-dashboard-button-icon" />
              <span>Upload New Signature</span>
            </button>
            {signatureFile && ( /* This button is conditionally rendered, so its container needs to be conditional too */
              <div className="hod-dashboard-banner-actions-responsive-item">
                <button
                  onClick={handleSaveSignature}
                  disabled={uploadingSignature}
                  className="hod-dashboard-button-success"
                >
                  Save Signature
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Stats Cards */}
      <div className="hod-dashboard-stats-grid">
        <div className="hod-dashboard-stat-card">
          <div className="hod-dashboard-stat-icon-wrapper hod-dashboard-stat-icon-purple">
            <FileText size={24} />
          </div>
          <div className="hod-dashboard-stat-content">
            <p className="hod-dashboard-stat-label">Total Addressed</p>
            <p className="hod-dashboard-stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="hod-dashboard-stat-card">
          <div className="hod-dashboard-stat-icon-wrapper hod-dashboard-stat-icon-yellow">
            <Clock size={24} />
          </div>
          <div className="hod-dashboard-stat-content">
            <p className="hod-dashboard-stat-label">Pending Review</p>
            <p className="hod-dashboard-stat-value">{stats.pending}</p>
          </div>
        </div>

        <div className="hod-dashboard-stat-card">
          <div className="hod-dashboard-stat-icon-wrapper hod-dashboard-stat-icon-green">
            <CheckCircle size={24} />
          </div>
          <div className="hod-dashboard-stat-content">
            <p className="hod-dashboard-stat-label">Approved</p>
            <p className="hod-dashboard-stat-value">{stats.approved}</p>
          </div>
        </div>

        <div className="hod-dashboard-stat-card">
          <div className="hod-dashboard-stat-icon-wrapper hod-dashboard-stat-icon-red">
            <XCircle size={24} />
          </div>
          <div className="hod-dashboard-stat-content">
            <p className="hod-dashboard-stat-label">Rejected</p>
            <p className="hod-dashboard-stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="hod-dashboard-table-card">
        {loading ? (
          <div className="hod-dashboard-table-loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="hod-dashboard-no-requests">
            <CheckCircle className="hod-dashboard-no-requests-icon" />
            <p className="hod-dashboard-no-requests-title">All caught up!</p>
            <p className="hod-dashboard-no-requests-message">No pending items for HOD review.</p>
          </div>
        ) : (
          <div className="hod-dashboard-table-wrapper">
            <table className="hod-dashboard-table">
              <thead className="hod-dashboard-table-head">
                <tr className="hod-dashboard-table-row-head">
                  <th className="hod-dashboard-table-th hod-dashboard-table-th-left">Student</th>
                  <th className="hod-dashboard-table-th hod-dashboard-table-th-left">Request Type</th>
                  <th className="hod-dashboard-table-th hod-dashboard-table-th-left">Date</th>
                  <th className="hod-dashboard-table-th hod-dashboard-table-th-center">Document</th>
                  <th className="hod-dashboard-table-th hod-dashboard-table-th-right">Actions</th>
                </tr>
              </thead>
              <tbody className="hod-dashboard-table-body">
                {requests.map(req => (
                  <tr key={req.id} className="hod-dashboard-table-row">
                    <td className="hod-dashboard-table-td">
                      <div className="hod-dashboard-student-name">{req.student.name}</div>
                      <div className="hod-dashboard-student-rollno">{req.student.rollNumber}</div>
                    </td>
                    <td className="hod-dashboard-table-td hod-dashboard-request-type">
                      {req.type.replace('_', ' ')}
                    </td>
                    <td className="hod-dashboard-table-td hod-dashboard-request-date">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="hod-dashboard-table-td hod-dashboard-table-td-center">
                      <button
                        onClick={() => setPreviewRequest(req)}
                        className="hod-dashboard-preview-button"
                      >
                        <Eye size={16} className="hod-dashboard-preview-button-icon" /> Preview
                      </button>
                    </td>
                    <td className="hod-dashboard-table-td hod-dashboard-table-td-right">
                      {rejectingId === req.id ? (
                        <div className="hod-dashboard-reject-form animate-in slide-in-from-right-2">
                          <input
                            type="text"
                            placeholder="Reason for rejection..."
                            value={reason} onChange={e => setReason(e.target.value)}
                            className="hod-dashboard-reject-input"
                            autoFocus
                          />
                          <button onClick={() => handleReject(req.id)} className="hod-dashboard-reject-confirm-button">Confirm</button>
                          <button onClick={() => { setRejectingId(null); setReason(''); }} className="hod-dashboard-reject-cancel-button">Cancel</button>
                        </div>
                      ) : (
                        <div className="hod-dashboard-action-buttons">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={!profile?.signatureUrl}
                            className={`hod-dashboard-approve-button ${!profile?.signatureUrl ? 'hod-dashboard-button-disabled' : ''}`}
                          >
                            <CheckCircle size={16} className="hod-dashboard-button-icon" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="hod-dashboard-reject-button"
                          >
                            <XCircle size={16} className="hod-dashboard-button-icon" /> Reject
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

      {/* Signature Pad Modal */}
    </div>
  );
};

export default HodDashboard;
