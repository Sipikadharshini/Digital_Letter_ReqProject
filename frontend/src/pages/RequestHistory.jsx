import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/requests/student');
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
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><Clock size={12} className="mr-1"/> Awaiting Advisor</span>;
      case 'PENDING_HOD':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><Clock size={12} className="mr-1"/> Awaiting HOD</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle size={12} className="mr-1"/> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle size={12} className="mr-1"/> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Request History</h2>
          <p className="text-sm text-gray-500 mt-1">Track the status of your submitted documents</p>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div className="p-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-800">No requests found</p>
          <p className="text-gray-500 mt-1">You haven't submitted any letter requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Note</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                    {request.status === 'REJECTED' && request.rejectionReason ? request.rejectionReason : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === 'APPROVED' && request.signedDocPath ? (
                      <a 
                        href={`http://localhost:5000/${request.signedDocPath}`} 
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        <Download size={16} className="mr-1" /> Download PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">Not Available</span>
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
