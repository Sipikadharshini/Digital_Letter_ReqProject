const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth'); // Corrected path
const multer = require('multer');

// Configure multer for memory storage to process images with sharp
// This ensures the file content is available as a buffer in req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Admin routes (example, adjust as per your actual routes)
router.post('/admin/users/admin', authMiddleware(), userController.createAdmin);
router.post('/admin/users/faculty', authMiddleware(), userController.createFaculty);
router.post('/admin/users/hod', authMiddleware(), userController.createHOD);
router.post('/admin/users/student', authMiddleware(), userController.createStudent);

// User profile and signature routes
// GET profile
router.get('/profile', authMiddleware(), userController.getProfile);
// Apply multer middleware here: upload.single('signature')
router.post('/signature', authMiddleware(), upload.single('signature'), userController.uploadSignature);

module.exports = router;