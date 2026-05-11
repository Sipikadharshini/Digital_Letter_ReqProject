import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Hash, Trash2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [rollNo, setRollNo] = useState('');
  const [newStaff, setNewStaff] = useState({ employeeId: '', role: 'FACULTY' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/users`);
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoll = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/admin/add-roll-number`, { rollNumber: rollNo });
      alert('Roll number added for pre-registration');
      setRollNo('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding roll number');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/admin/add-staff`, newStaff);
      alert('Staff pre-registered successfully');
      setNewStaff({ employeeId: '', role: 'FACULTY' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error pre-registering staff');
    }
  };

  const handleAssignAdvisor = async (studentId, facultyId) => {
    if (!facultyId) return;
    try {
      await axios.post(`${API}/api/admin/assign-advisor`, { studentId, facultyId });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning advisor');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/api/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Add Roll Number Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Hash size={20} className="mr-2 text-primary-600" />
              Pre-Register Student
            </h3>
            <p className="text-sm text-gray-500 mt-1">Add a roll number to allow a student to register.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddRoll} className="flex gap-4">
              <input 
                type="text" 
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                placeholder="Enter Roll Number"
                required
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors"
              >
                Add 
              </button>
            </form>
          </div>
        </div>

        {/* Add Faculty/HOD Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <UserPlus size={20} className="mr-2 text-primary-600" />
              Pre-Register Staff
            </h3>
            <p className="text-sm text-gray-500 mt-1">Pre-register Faculty or HOD by Employee ID.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" required placeholder="Employee ID"
                  value={newStaff.employeeId} onChange={e => setNewStaff({...newStaff, employeeId: e.target.value})}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <select 
                  value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="FACULTY">Faculty Advisor</option>
                  <option value="HOD">HOD</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full mt-4 px-6 py-2.5 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors"
              >
                Pre-Register Staff
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">System Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">Role</th>
                <th className="py-3 px-6 font-semibold">Email</th>
                <th className="py-3 px-6 font-semibold">Roll No / Emp ID</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold">Faculty Advisor</th>
                <th className="py-3 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="3" className="py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-6 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
                        u.role === 'HOD' ? 'bg-purple-50 text-purple-600' :
                        u.role === 'FACULTY' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      {u.email || <span className="text-gray-400 italic">No Email</span>}
                    </td>
                    <td className="py-3 px-6 text-gray-600 font-medium">
                      {u.rollNumber || u.employeeId || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.isActivated ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {u.isActivated ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {u.role === 'STUDENT' ? (
                        <select
                          className="px-2 py-1.5 text-xs font-semibold border border-gray-200 rounded-md text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary-500 w-full max-w-[150px] cursor-pointer"
                          value={u.advisorId || ''}
                          onChange={(e) => handleAssignAdvisor(u.id, e.target.value)}
                        >
                          <option value="" disabled>Select Advisor</option>
                          {users
                            .filter(f => f.role === 'FACULTY')
                            .map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
