const express = require('express');
const { createBox, uploadImage, setBoxPermissions } = require('../controllers/boxController');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkBoxPermission } = require('../middlewares/permissionMiddleware');
const router = express.Router();

router.post('/box', authenticate, createBox);
router.post('/box/:boxId/image', authenticate, checkBoxPermission('upload'), uploadImage);
router.post('/box/:boxId/permission', authenticate, setBoxPermissions);

module.exports = router;
