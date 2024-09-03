const express = require('express');
const router = express.Router();
const { addUser, login } = require('../controllers/authController');


router.post("/signup", addUser);
router.post('/login', login);

module.exports = router;
