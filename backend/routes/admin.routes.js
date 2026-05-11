const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');

router.post('/add-roll-number', authMiddleware(['ADMIN']), adminController.addPreRegisteredStudent);
router.post('/add-staff', authMiddleware(['ADMIN']), adminController.addPreRegisteredStaff);
router.post('/assign-advisor', authMiddleware(['ADMIN']), adminController.assignAdvisor);
router.get('/stats', authMiddleware(['ADMIN']), adminController.getDashboardStats);
router.get('/users', authMiddleware(['ADMIN']), adminController.getAllUsers);
router.delete('/users/:id', authMiddleware(['ADMIN']), adminController.deleteUser);

module.exports = router;
