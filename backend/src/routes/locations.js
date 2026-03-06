const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { validateLocation } = require('../middleware/validator');

router.get('/', LocationController.getAll);
router.get('/counts', LocationController.getItemCounts);
router.get('/:id', LocationController.getById);
router.post('/', validateLocation, LocationController.create);
router.put('/:id', validateLocation, LocationController.update);
router.delete('/:id', LocationController.delete);

module.exports = router;
