const express = require('express');
const router = express.Router();
const BackupController = require('../controllers/backupController');

router.get('/export', BackupController.exportData);
router.post('/import', BackupController.importData);
router.get('/info', BackupController.getBackupInfo);

module.exports = router;