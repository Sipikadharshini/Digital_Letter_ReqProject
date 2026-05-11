const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

// Helper function to check for duplicates
const checkDuplicates = async (email, rollNumber = null, employeeId = null) => {
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error('Email already in use.');
  }

  if (rollNumber) {
    const existingRollNumber = await prisma.user.findUnique({ where: { rollNumber } });
    if (existingRollNumber) throw new Error('Roll Number already exists.');
  }

  if (employeeId) {
    const existingEmployeeId = await prisma.user.findUnique({ where: { employeeId } });
    if (existingEmployeeId) throw new Error('Employee ID already exists.');
  }
};

// 1. Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await checkDuplicates(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    res.status(201).json({ message: 'Admin created successfully', user: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// 2. Create Faculty
exports.createFaculty = async (req, res) => {
  try {
    const { name, email, password, employeeId } = req.body;

    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required for Faculty' });
    await checkDuplicates(email, null, employeeId);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        password: hashedPassword,
        role: 'FACULTY',
        isActivated: true
      },
    });

    res.status(201).json({ message: 'Faculty created successfully', user: { id: faculty.id, name: faculty.name, employeeId: faculty.employeeId } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// 3. Create HOD
exports.createHOD = async (req, res) => {
  try {
    const { name, email, password, employeeId } = req.body;

    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required for HOD' });
    await checkDuplicates(email, null, employeeId);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const hod = await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        password: hashedPassword,
        role: 'HOD',
        isActivated: true
      },
    });

    res.status(201).json({ message: 'HOD created successfully', user: { id: hod.id, name: hod.name, employeeId: hod.employeeId } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// 4. Create Student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, year, batch, advisorId } = req.body;

    if (!rollNumber) return res.status(400).json({ message: 'Roll Number is required for students' });
    if (!advisorId) return res.status(400).json({ message: 'Advisor ID is required for students' });

    // Ensure advisor exists and is a faculty member
    const advisor = await prisma.user.findUnique({ where: { id: advisorId } });
    if (!advisor || advisor.role !== 'FACULTY') {
      return res.status(400).json({ message: 'Invalid Advisor ID. Associated user must be a FACULTY member.' });
    }

    await checkDuplicates(email, rollNumber, null);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        rollNumber,
        year: parseInt(year),
        batch,
        advisorId,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    res.status(201).json({ message: 'Student created successfully', user: { id: student.id, name: student.name, rollNumber: student.rollNumber, advisorId: student.advisorId } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// 5. Upload Signature (Faculty/HOD)
exports.uploadSignature = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No signature image provided' });
    }

    const signaturePath = `uploads/signatures/${file.filename}`;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { signatureUrl: signaturePath },
      select: { id: true, name: true, signatureUrl: true }
    });

    res.json({ message: 'Signature updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signature upload' });
  }
};
