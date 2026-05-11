const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.registerStudent);
router.post('/register-staff', authController.registerStaff);
router.post('/login', authController.login);

module.exports = router;
