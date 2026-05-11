const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for signatures
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/signatures/');
  },
  filename: (req, file, cb) => {
    cb(null, `signature_${req.user.userId}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadSignatureParams = multer({
  storage: signatureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image file (PNG/JPG)'));
    }
  }
});

router.post('/admin', userController.createAdmin);
router.post('/faculty', userController.createFaculty);
router.post('/hod', userController.createHOD);
router.post('/student', userController.createStudent);

router.get('/profile', authMiddleware(), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, rollNumber: true, year: true, batch: true, signatureUrl: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signature', authMiddleware(['FACULTY', 'HOD']), uploadSignatureParams.single('signature'), userController.uploadSignature);

module.exports = router;
