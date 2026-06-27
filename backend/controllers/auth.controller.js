const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PreRegisteredStudent = require('../models/PreRegisteredStudent');
const PreRegisteredStaff = require('../models/PreRegisteredStaff');
const emailService = require('../services/email.service');
const { isValidEmail } = require('../utils/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const normalizeEmail = (email) => email.trim().toLowerCase();
const validateStudentEmailDomain = (email) => {
  const allowedDomain = process.env.STUDENT_EMAIL_DOMAIN;

  if (!allowedDomain) {
    return null;
  }

  const normalizedDomain = allowedDomain.trim().toLowerCase().replace(/^@/, '');
  if (!email.endsWith(`@${normalizedDomain}`)) {
    return `Please use your college email address ending with @${normalizedDomain}.`;
  }

  return null;
};

exports.sendStudentOtp = async (req, res) => {
  try {
    const { rollNumber, email } = req.body;

    if (!rollNumber) {
      return res.status(400).json({ message: 'Roll Number is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const domainError = validateStudentEmailDomain(normalizedEmail);
    if (domainError) {
      return res.status(400).json({ message: domainError });
    }

    const preReg = await PreRegisteredStudent.findOne({ rollNumber });

    if (!preReg) {
      return res.status(400).json({ message: 'Roll Number not registered with the department.' });
    }

    if (preReg.registered) {
      return res.status(400).json({ message: 'Student already registered.' });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const existingRollNumber = await User.findOne({ rollNumber });
    if (existingRollNumber) {
      return res.status(400).json({ message: 'Roll Number already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.findOneAndUpdate(
      { rollNumber, email: normalizedEmail },
      { $set: { otpHash, expiresAt } },
      { upsert: true, returnDocument: 'after' }
    );

    const emailText = `Hello,\n\nYour DocFlow student registration OTP is ${otp}.\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.\n\nBest Regards,\nDocFlow System`;
    const sent = await emailService.sendEmail(normalizedEmail, 'DocFlow Student Registration OTP', emailText);

    if (!sent) {
      return res.status(500).json({ message: 'Unable to send OTP email. Please try again later.' });
    }

    res.json({ message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { rollNumber, name, email, year, batch, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const domainError = validateStudentEmailDomain(normalizedEmail);
    if (domainError) {
      return res.status(400).json({ message: domainError });
    }

    // Check if roll number is pre-registered
    const preReg = await PreRegisteredStudent.findOne({ rollNumber });

    if (!preReg) {
      return res.status(400).json({ message: 'Roll Number not registered with the department.' });
    }

    if (preReg.registered) {
      return res.status(400).json({ message: 'Student already registered.' });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const existingRollNumber = await User.findOne({ rollNumber });
    if (existingRollNumber) {
      return res.status(400).json({ message: 'Roll Number already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name,
      role: 'STUDENT',
      rollNumber,
      year: parseInt(year),
      batch,
      isActivated: true
    });

    // Mark as registered
    await PreRegisteredStudent.findOneAndUpdate({ rollNumber }, { registered: true });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStaff = async (req, res) => {
  try {
    const { employeeId, name, email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const preReg = await PreRegisteredStaff.findOne({ employeeId });

    if (!preReg) {
      return res.status(400).json({ message: 'Employee ID not registered with the department.' });
    }

    if (preReg.isActivated) {
      return res.status(400).json({ message: 'Staff member already registered.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      name,
      role: preReg.role,
      employeeId,
      isActivated: true
    });

    await PreRegisteredStaff.findOneAndUpdate({ employeeId }, { isActivated: true });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    // loginId can be rollNumber (student), employeeId (staff) or email (admin/others)

    let user = await User.findOne({
      $or: [
        { rollNumber: loginId },
        { employeeId: loginId },
        { email: loginId }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name, rollNumber: user.rollNumber },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        rollNumber: user.rollNumber,
        signatureUrl: user.signatureUrl || null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
