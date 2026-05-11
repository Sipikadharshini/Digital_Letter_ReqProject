const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

exports.addPreRegisteredStudent = async (req, res) => {
  try {
    const { rollNumber } = req.body;
    
    // Check if exists
    const existing = await prisma.preRegisteredStudent.findUnique({ where: { rollNumber } });
    if (existing) {
      return res.status(400).json({ message: 'Roll number already in pre-registration list.' });
    }

    const preReg = await prisma.preRegisteredStudent.create({
      data: { rollNumber }
    });

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

    const existing = await prisma.preRegisteredStaff.findUnique({ where: { employeeId } });
    if (existing) {
      return res.status(400).json({ message: 'Employee ID already in pre-registration list.' });
    }

    const preReg = await prisma.preRegisteredStaff.create({
      data: { employeeId, role }
    });

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
    const faculty = await prisma.user.findUnique({ where: { id: facultyId } });
    if (!faculty || faculty.role !== 'FACULTY') {
      return res.status(400).json({ message: 'Invalid Faculty Advisor' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      return res.status(400).json({ message: 'Invalid Student' });
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { advisorId: facultyId }
    });

    res.json({ message: 'Advisor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, rollNumber: true, employeeId: true, advisorId: true, isActivated: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, requestCount] = await Promise.all([
      prisma.user.findMany({
        select: { role: true }
      }),
      prisma.request.count()
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};
