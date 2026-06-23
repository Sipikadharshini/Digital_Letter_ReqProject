import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Hash, Trash2 } from 'lucide-react';
import '../styles/AdminUsers.css'; // Import the new CSS file

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
    <div className="admin-users-container animate-in fade-in duration-500">
      <div className="admin-users-grid-cards">

        {/* Add Roll Number Card */}
        <div className="admin-users-card">
          <div className="admin-users-card-header">
            <h3 className="admin-users-card-title">
              <Hash size={20} className="admin-users-card-icon" />
              Pre-Register Student
            </h3>
            <p className="admin-users-card-description">Add a roll number to allow a student to register.</p>
          </div>
          <div className="admin-users-card-body">
            <form onSubmit={handleAddRoll} className="admin-users-form-inline">
              <input
                type="text"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                placeholder="Enter Roll Number"
                required
                className="admin-users-input"
              />
              <button
                type="submit"
                className="admin-users-button-primary"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Add Faculty/HOD Card */}
        <div className="admin-users-card">
          <div className="admin-users-card-header">
            <h3 className="admin-users-card-title">
              <UserPlus size={20} className="admin-users-card-icon" />
              Pre-Register Staff
            </h3>
            <p className="admin-users-card-description">Pre-register Faculty or HOD by Employee ID.</p>
          </div>
          <div className="admin-users-card-body">
            <form onSubmit={handleAddStaff} className="admin-users-form-stacked">
              <div className="admin-users-form-grid">
                <input
                  type="text" required placeholder="Employee ID"
                  value={newStaff.employeeId} onChange={e => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                  className="admin-users-input"
                />
                <select
                  value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="admin-users-select"
                >
                  <option value="FACULTY">Faculty Advisor</option>
                  <option value="HOD">HOD</option>
                </select>
              </div>
              <button
                type="submit"
                className="admin-users-button-full-width"
              >
                Pre-Register Staff
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="admin-users-table-card">
        <div className="admin-users-table-header">
          <h3 className="admin-users-table-title">System Users</h3>
        </div>
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead className="admin-users-table-head">
              <tr className="admin-users-table-row-head">
                <th className="admin-users-table-th">Name</th>
                <th className="admin-users-table-th">Role</th>
                <th className="admin-users-table-th">Email</th>
                <th className="admin-users-table-th">Roll No / Emp ID</th>
                <th className="admin-users-table-th">Status</th>
                <th className="admin-users-table-th">Faculty Advisor</th>
                <th className="admin-users-table-th admin-users-table-th-center">Actions</th>
              </tr>
            </thead>
            <tbody className="admin-users-table-body">
              {loading ? (
                <tr><td colSpan="7" className="admin-users-table-loading">Loading users...</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="admin-users-table-row">
                    <td className="admin-users-table-td admin-users-table-td-name">{u.name}</td>
                    <td className="admin-users-table-td">
                      <span className={`admin-users-role-badge ${u.role === 'ADMIN' ? 'admin-users-role-admin' : u.role === 'HOD' ? 'admin-users-role-hod' : u.role === 'FACULTY' ? 'admin-users-role-faculty' : 'admin-users-role-student'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="admin-users-table-td admin-users-table-td-email">
                      {u.email || <span className="admin-users-text-placeholder">No Email</span>}
                    </td>
                    <td className="admin-users-table-td admin-users-table-td-id">
                      {u.rollNumber || u.employeeId || <span className="admin-users-text-placeholder">N/A</span>}
                    </td>
                    <td className="admin-users-table-td">
                      <span className={`admin-users-status-badge ${u.isActivated ? 'admin-users-status-active' : 'admin-users-status-pending'}`}>
                        {u.isActivated ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="admin-users-table-td">
                      {u.role === 'STUDENT' ? (
                        <select
                          className="admin-users-advisor-select"
                          value={u.advisorId || ''}
                          onChange={(e) => handleAssignAdvisor(u.id, e.target.value)}
                        >
                          <option value="" disabled>Select Advisor</option>
                          {users
                            .filter(f => f.role === 'FACULTY')
                            .map(f => (
                              <option key={f.id} value={f.id} className="admin-users-advisor-option">{f.name}</option>
                            ))}
                        </select>
                      ) : (
                        <span className="admin-users-text-placeholder admin-users-text-xs-italic">N/A</span>
                      )}
                    </td>
                    <td className="admin-users-table-td admin-users-table-td-center">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="admin-users-delete-button"
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
