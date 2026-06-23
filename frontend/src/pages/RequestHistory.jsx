import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import '../styles/RequestHistory.css'; // Import the new CSS file

const API = import.meta.env.VITE_API_URL;

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${API}/api/requests/student`);
        setRequests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_ADVISOR':
        return <span className="request-status-badge request-status-pending-advisor"><Clock size={12} className="request-status-icon"/> Awaiting Advisor</span>;
      case 'PENDING_HOD':
        return <span className="request-status-badge request-status-pending-hod"><Clock size={12} className="request-status-icon"/> Awaiting HOD</span>;
      case 'APPROVED':
        return <span className="request-status-badge request-status-approved"><CheckCircle size={12} className="request-status-icon"/> Approved</span>;
      case 'REJECTED':
        return <span className="request-status-badge request-status-rejected"><XCircle size={12} className="request-status-icon"/> Rejected</span>;
      default:
        return <span className="request-status-badge request-status-default">{status}</span>;
    }
  };

  return (
    <div className="request-history-container animate-in fade-in duration-500">
      <div className="request-history-header">
        <div className="request-history-header-content">
          <h2 className="request-history-title">Request History</h2>
          <p className="request-history-description">Track the status of your submitted documents</p>
        </div>
      </div>
      
      {loading ? (
        <div className="request-history-loading">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div className="request-history-no-requests">
          <AlertCircle className="request-history-no-requests-icon" />
          <p className="request-history-no-requests-title">No requests found</p>
          <p className="request-history-no-requests-message">You haven't submitted any letter requests yet.</p>
        </div>
      ) : (
        <div className="request-history-table-wrapper">
          <table className="request-history-table">
            <thead className="request-history-table-head">
              <tr className="request-history-table-row-head">
                <th scope="col" className="request-history-table-th">Date</th>
                <th scope="col" className="request-history-table-th">Type</th>
                <th scope="col" className="request-history-table-th">Status</th>
                <th scope="col" className="request-history-table-th">Note</th>
                <th scope="col" className="request-history-table-th request-history-table-th-right">Document</th>
              </tr>
            </thead>
            <tbody className="request-history-table-body">
              {requests.map((request) => (
                <tr key={request.id} className="request-history-table-row">
                  <td className="request-history-table-td request-history-date">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="request-history-table-td request-history-type">
                    {request.type.replace('_', ' ')}
                  </td>
                  <td className="request-history-table-td request-history-status">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="request-history-table-td request-history-note">
                    {request.status === 'REJECTED' && request.rejectionReason ? request.rejectionReason : '-'}
                  </td>
                  <td className="request-history-table-td request-history-document-cell">
                    {request.status === 'APPROVED' && request.signedDocPath ? (
                      <a 
                        href={`${API}/${request.signedDocPath}`} 
                        target="_blank" rel="noreferrer"
                        className="request-history-download-link"
                      >
                        <Download size={16} className="request-history-download-icon" /> Download PDF
                      </a>
                    ) : (
                      <span className="request-history-not-available">Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
