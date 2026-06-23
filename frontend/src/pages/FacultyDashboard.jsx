import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/FacultyDashboard.css'; // Import the new CSS file
import { FileSignature, CheckCircle, XCircle, Eye, AlertCircle, FileText, Clock, Upload, PenTool } from 'lucide-react';
import DocumentPreview from '../components/DocumentPreview';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const FacultyDashboard = () => {
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
        axios.get(`${API}/api/requests/faculty`),
        axios.get(`${API}/api/requests/faculty/stats`)
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
    if (!window.confirm('Are you sure you want to approve this request and attach your digital signature?')) return;
    try {
      await axios.post(`${API}/api/requests/${id}/approve/faculty`);
      alert('Request approved successfully');
      fetchRequests();
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    if (!reason) return alert('Please provide a reason for rejection');
    try {
      await axios.post(`${API}/api/requests/${id}/reject/faculty`, { reason });
      alert('Request rejected');
      setRejectingId(null);
      setReason('');
      fetchRequests();
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  return (
    <div className="faculty-dashboard-container animate-in fade-in duration-500">
      <div className="faculty-dashboard-header-card">
        <div className="faculty-dashboard-header-content">
          <h2 className="faculty-dashboard-title">Faculty Dashboard</h2>
          <p className="text-gray-500 mt-1">Review and approve pending student requests</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center font-bold">
          <FileSignature className="mr-2" size={20} />
          {requests.length} Pending
        </div>
      </div>

      {/* Profile Fetch Error Banner */}
      {profileError && (
        <div className="faculty-dashboard-banner faculty-dashboard-banner-error animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="faculty-dashboard-banner-content">
            <div className="faculty-dashboard-banner-text">Error loading profile: {profileError}</div>
            <button onClick={() => setProfileError(null)} className="faculty-dashboard-banner-dismiss-button">Dismiss</button>
          </div>
        </div>
      )}
      {uploadError && (
        <div className="faculty-dashboard-banner faculty-dashboard-banner-error animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="faculty-dashboard-banner-content">
            <div className="faculty-dashboard-banner-text">{uploadError}</div>
            <button onClick={() => setUploadError(null)} className="faculty-dashboard-banner-dismiss-button">Dismiss</button>
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
        <div className="faculty-dashboard-banner faculty-dashboard-banner-warning animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="faculty-dashboard-banner-content-with-icon">
            <div className="faculty-dashboard-banner-icon-wrapper">
              <PenTool className="faculty-dashboard-banner-icon faculty-dashboard-banner-icon-warning" />
            </div>
            <div className="faculty-dashboard-banner-text-content">
              <h3 className="faculty-dashboard-banner-title-warning">Action Required: Upload Your Signature</h3>
              <div className="faculty-dashboard-banner-description-warning">
                <p>Before you can approve documents, please upload a picture of your signature.</p>
              </div>
              <div className="faculty-dashboard-banner-actions-responsive">
                <button
                  onClick={handleChooseSignature}
                  disabled={uploadingSignature}
                  className={`faculty-dashboard-button-warning ${uploadingSignature ? 'faculty-dashboard-button-disabled' : ''}`}
                >
                  <Upload size={16} className="faculty-dashboard-button-icon" />
                  <span>Upload Signature Image</span>
                </button>
                {signatureFile && (
                  <div className="faculty-dashboard-banner-actions-responsive-item">
                    <button
                      onClick={handleSaveSignature}
                      disabled={uploadingSignature}
                      className="faculty-dashboard-button-success"
                    >
                      Save Signature
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Configured Banner */}
      {profile?.signatureUrl && (
        <div className="faculty-dashboard-banner faculty-dashboard-banner-success animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="faculty-dashboard-banner-content-with-icon faculty-dashboard-banner-content-responsive">
            <div className="faculty-dashboard-banner-icon-wrapper">
              <CheckCircle className="faculty-dashboard-banner-icon faculty-dashboard-banner-icon-success" />
            </div>
            <div className="faculty-dashboard-banner-text-content">
              <h3 className="faculty-dashboard-banner-title-success">Signature Configured</h3>
              <div className="faculty-dashboard-banner-description-success">
                <p>Your signature will be automatically embedded when you approve documents.</p>
              </div>
              <div className="faculty-dashboard-signature-preview-wrapper">
                <div className="faculty-dashboard-signature-preview">
                  <img src={`${API}/${profile.signatureUrl}`} alt="Your Signature" className="faculty-dashboard-signature-image" />
                </div>
              </div>
            </div>
          </div>
          <div className="faculty-dashboard-banner-actions-responsive">
            <button
              onClick={handleChooseSignature}
              disabled={uploadingSignature}
              className={`faculty-dashboard-button-secondary ${uploadingSignature ? 'faculty-dashboard-button-disabled' : ''}`}
            >
              <Upload size={16} className="faculty-dashboard-button-icon" />
              <span>Upload New Signature</span>
            </button>
            {signatureFile && ( /* This button is conditionally rendered, so its container needs to be conditional too */
              <div className="faculty-dashboard-banner-actions-responsive-item">
                <button
                  onClick={handleSaveSignature}
                  disabled={uploadingSignature}
                  className="faculty-dashboard-button-success"
                >
                  Save Signature
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Stats Cards */}
      <div className="faculty-dashboard-stats-grid">
        <div className="faculty-dashboard-stat-card">
          <div className="faculty-dashboard-stat-icon-wrapper faculty-dashboard-stat-icon-blue">
            <FileText size={24} />
          </div>
          <div className="faculty-dashboard-stat-content">
            <p className="faculty-dashboard-stat-label">Total Requests</p>
            <p className="faculty-dashboard-stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="faculty-dashboard-stat-card">
          <div className="faculty-dashboard-stat-icon-wrapper faculty-dashboard-stat-icon-yellow">
            <Clock size={24} />
          </div>
          <div className="faculty-dashboard-stat-content">
            <p className="faculty-dashboard-stat-label">Pending Review</p>
            <p className="faculty-dashboard-stat-value">{stats.pending}</p>
          </div>
        </div>

        <div className="faculty-dashboard-stat-card">
          <div className="faculty-dashboard-stat-icon-wrapper faculty-dashboard-stat-icon-green">
            <CheckCircle size={24} />
          </div>
          <div className="faculty-dashboard-stat-content">
            <p className="faculty-dashboard-stat-label">Approved</p>
            <p className="faculty-dashboard-stat-value">{stats.approved}</p>
          </div>
        </div>

        <div className="faculty-dashboard-stat-card">
          <div className="faculty-dashboard-stat-icon-wrapper faculty-dashboard-stat-icon-red">
            <XCircle size={24} />
          </div>
          <div className="faculty-dashboard-stat-content">
            <p className="faculty-dashboard-stat-label">Rejected</p>
            <p className="faculty-dashboard-stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="faculty-dashboard-table-card">
        {loading ? (
          <div className="faculty-dashboard-table-loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="faculty-dashboard-no-requests">
            <CheckCircle className="faculty-dashboard-no-requests-icon" />
            <p className="faculty-dashboard-no-requests-title">All caught up!</p>
            <p className="faculty-dashboard-no-requests-message">There are no pending requests for you to review at this time.</p>
          </div>
        ) : (
          <div className="faculty-dashboard-table-wrapper">
            <table className="faculty-dashboard-table">
              <thead className="faculty-dashboard-table-head">
                <tr className="faculty-dashboard-table-row-head">
                  <th className="faculty-dashboard-table-th faculty-dashboard-table-th-left">Student</th>
                  <th className="faculty-dashboard-table-th faculty-dashboard-table-th-left">Request Type</th>
                  <th className="faculty-dashboard-table-th faculty-dashboard-table-th-left">Date</th>
                  <th className="faculty-dashboard-table-th faculty-dashboard-table-th-center">Document</th>
                  <th className="faculty-dashboard-table-th faculty-dashboard-table-th-right">Actions</th>
                </tr>
              </thead>
              <tbody className="faculty-dashboard-table-body">
                {requests.map(req => (
                  <tr key={req.id} className="faculty-dashboard-table-row">
                    <td className="faculty-dashboard-table-td">
                      <div className="faculty-dashboard-student-name">{req.student.name}</div>
                      <div className="faculty-dashboard-student-details">{req.student.rollNumber} • {req.student.year} Year • {req.student.batch} Batch</div>
                    </td>
                    <td className="faculty-dashboard-table-td faculty-dashboard-request-type">
                      {req.type.replace('_', ' ')}
                    </td>
                    <td className="faculty-dashboard-table-td faculty-dashboard-request-date">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="faculty-dashboard-table-td faculty-dashboard-table-td-center">
                      <button
                        onClick={() => setPreviewRequest(req)}
                        className="faculty-dashboard-preview-button"
                      >
                        <Eye size={16} className="faculty-dashboard-preview-button-icon" /> Preview
                      </button>
                    </td>
                    <td className="faculty-dashboard-table-td faculty-dashboard-table-td-right">
                      {rejectingId === req.id ? (
                        <div className="faculty-dashboard-reject-form animate-in slide-in-from-right-2">
                          <input
                            type="text"
                            placeholder="Reason for rejection..."
                            value={reason} onChange={e => setReason(e.target.value)}
                            className="faculty-dashboard-reject-input"
                            autoFocus
                          />
                          <button onClick={() => handleReject(req.id)} className="faculty-dashboard-reject-confirm-button">Confirm</button>
                          <button onClick={() => { setRejectingId(null); setReason(''); }} className="faculty-dashboard-reject-cancel-button">Cancel</button>
                        </div>
                      ) : (
                        <div className="faculty-dashboard-action-buttons">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={!profile?.signatureUrl}
                            className={`faculty-dashboard-approve-button ${!profile?.signatureUrl ? 'faculty-dashboard-button-disabled' : ''}`}
                          >
                            <CheckCircle size={16} className="faculty-dashboard-button-icon" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="faculty-dashboard-reject-button"
                          >
                            <XCircle size={16} className="faculty-dashboard-button-icon" /> Reject
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
      {
        previewRequest && (
          <DocumentPreview
            request={previewRequest}
            onClose={() => setPreviewRequest(null)}
          />
        )
      }

      {/* Signature Pad Modal */}
    </div >
  );
};

export default FacultyDashboard;
