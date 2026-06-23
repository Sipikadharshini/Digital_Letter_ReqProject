const bcrypt = require('bcrypt');
const User = require('../models/User');
const Request = require('../models/Request');
const PreRegisteredStudent = require('../models/PreRegisteredStudent');
const PreRegisteredStaff = require('../models/PreRegisteredStaff');

exports.addPreRegisteredStudent = async (req, res) => {
  try {
    const { rollNumber } = req.body;
    
    // Check if exists
    const existing = await PreRegisteredStudent.findOne({ rollNumber });
    if (existing) {
      return res.status(400).json({ message: 'Roll number already in pre-registration list.' });
    }

    const preReg = await PreRegisteredStudent.create({ rollNumber });

    res.status(201).json({ message: 'Roll number added successfully', preReg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addPreRegisteredStaff = async (req, res) => {
  try {
    const { employeeId, role } = req.body; // role = 'FACULTY' or 'HOD'

    if (!['FACULTY', 'HOD'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be FACULTY or HOD' });
    }

    const existing = await PreRegisteredStaff.findOne({ employeeId });
    if (existing) {
      return res.status(400).json({ message: 'Employee ID already in pre-registration list.' });
    }

    const preReg = await PreRegisteredStaff.create({ employeeId, role });

    res.status(201).json({ message: 'Employee ID added successfully', preReg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignAdvisor = async (req, res) => {
  try {
    const { studentId, facultyId } = req.body;

    // Check if faculty exists and has correct role
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'FACULTY') {
      return res.status(400).json({ message: 'Invalid Faculty Advisor' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'STUDENT') {
      return res.status(400).json({ message: 'Invalid Student' });
    }

    await User.findByIdAndUpdate(studentId, { advisorId: facultyId });

    res.json({ message: 'Advisor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role rollNumber employeeId advisorId isActivated');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, requestCount] = await Promise.all([
      User.find().select('role'),
      Request.countDocuments()
    ]);

    const activeRoles = new Set(users.map((user) => user.role)).size;

    res.json({
      totalUsers: users.length,
      activeRoles,
      totalRequests: requestCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};
