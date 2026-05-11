const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.registerStudent = async (req, res) => {
  try {
    const { rollNumber, name, email, year, batch, password } = req.body;

    // Check if roll number is pre-registered
    const preReg = await prisma.preRegisteredStudent.findUnique({
      where: { rollNumber }
    });

    if (!preReg) {
      return res.status(400).json({ message: 'Roll Number not registered with the department.' });
    }

    if (preReg.registered) {
      return res.status(400).json({ message: 'Student already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'STUDENT',
        rollNumber,
        year: parseInt(year),
        batch
      }
    });

    // Mark as registered
    await prisma.preRegisteredStudent.update({
      where: { rollNumber },
      data: { registered: true }
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStaff = async (req, res) => {
  try {
    const { employeeId, name, email, password } = req.body;

    const preReg = await prisma.preRegisteredStaff.findUnique({
      where: { employeeId }
    });

    if (!preReg) {
      return res.status(400).json({ message: 'Employee ID not registered with the department.' });
    }

    if (preReg.isActivated) {
      return res.status(400).json({ message: 'Staff member already registered.' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: preReg.role,
        employeeId,
        isActivated: true
      }
    });

    await prisma.preRegisteredStaff.update({
      where: { employeeId },
      data: { isActivated: true }
    });

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

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { rollNumber: loginId },
          { employeeId: loginId },
          { email: loginId }
        ]
      }
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

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, rollNumber: user.rollNumber } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
