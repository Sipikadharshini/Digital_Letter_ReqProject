const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isValidEmail } = require('../utils/validation');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Helper function to check for duplicates
const checkDuplicates = async (email, rollNumber = null, employeeId = null) => {
  if (email) {
    if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new Error('Email already in use.');
  }

  if (rollNumber) {
    const existingRollNumber = await User.findOne({ rollNumber });
    if (existingRollNumber) throw new Error('Roll Number already exists.');
  }

  if (employeeId) {
    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) throw new Error('Employee ID already exists.');
  }
};

// 1. Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await checkDuplicates(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
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

    const faculty = await User.create({
      name,
      email,
      employeeId,
      password: hashedPassword,
      role: 'FACULTY',
      isActivated: true
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

    const hod = await User.create({
      name,
      email,
      employeeId,
      password: hashedPassword,
      role: 'HOD',
      isActivated: true
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
    const advisor = await User.findById(advisorId);
    if (!advisor || advisor.role !== 'FACULTY') {
      return res.status(400).json({ message: 'Invalid Advisor ID. Associated user must be a FACULTY member.' });
    }

    await checkDuplicates(email, rollNumber, null);

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      rollNumber,
      year: parseInt(year),
      batch,
      advisorId,
      password: hashedPassword,
      role: 'STUDENT',
    });

    res.status(201).json({ message: 'Student created successfully', user: { id: student.id, name: student.name, rollNumber: student.rollNumber, advisorId: student.advisorId } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// 5. Get Profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user.userId).select('name email role signatureUrl employeeId rollNumber year batch advisorId');
    if (!profile) return res.status(404).json({ message: 'User not found' });
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// 6. Upload Signature (Faculty/HOD)
exports.uploadSignature = async (req, res) => {
  try {
    const file = req.file;
    console.log('Received file from frontend:', file); // Log the received file object
    if (!file) {
      return res.status(400).json({ message: 'No signature image provided' });
    }

    const dir = path.join(__dirname, '..', 'uploads', 'signatures');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate modern signature file naming format
    const timestamp = Date.now();
    const newFilename = `signature_${req.user.userId}_${timestamp}.png`;
    const newPath = path.join(dir, newFilename);
    const signaturePath = `uploads/signatures/${newFilename}`;

    // Process image with Sharp
    const input = file.buffer || file.path;
    const processedImage = await sharp(input)
      .trim() // Trim whitespace
      .png({ quality: 90, compressionLevel: 9 }) // Optimize PNG, preserve transparency
      .toBuffer({ resolveWithObject: true });

    fs.writeFileSync(newPath, processedImage.data);

    // Clean up original file if multer saved it to disk
    if (file.path && fs.existsSync(file.path) && file.path !== newPath) {
      fs.unlinkSync(file.path);
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        signatureUrl: signaturePath,
        signatureType: 'draw',
        signatureWidth: processedImage.info.width,
        signatureHeight: processedImage.info.height
      },
      { returnDocument: 'after' }
    ).select('name signatureUrl');

    res.json({ message: 'Signature updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signature upload' });
  }
};
