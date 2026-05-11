const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const requestController = require('../controllers/request.controller');
const authMiddleware = require('../middleware/auth');

// Setup multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', authMiddleware(['STUDENT']), upload.single('document'), requestController.createRequest);
router.get('/student', authMiddleware(['STUDENT']), requestController.getStudentRequests);
router.get('/faculty', authMiddleware(['FACULTY']), requestController.getFacultyPendingRequests);
router.get('/faculty/stats', authMiddleware(['FACULTY']), requestController.getFacultyDashboardStats);
router.get('/hod', authMiddleware(['HOD']), requestController.getHODPendingRequests);
router.get('/hod/stats', authMiddleware(['HOD']), requestController.getHodDashboardStats);

router.post('/:id/approve/faculty', authMiddleware(['FACULTY']), requestController.facultyApprove);
router.post('/:id/reject/faculty', authMiddleware(['FACULTY']), requestController.facultyReject);

router.post('/:id/approve/hod', authMiddleware(['HOD']), requestController.hodApprove);
router.post('/:id/reject/hod', authMiddleware(['HOD']), requestController.hodReject);

module.exports = router;
