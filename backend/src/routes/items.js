const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');
const { validateItem } = require('../middleware/validator');

router.get('/', ItemController.getAll);
router.get('/categories', ItemController.getCategories);
router.get('/tags', ItemController.getTags);
router.get('/:id', ItemController.getById);
router.post('/', validateItem, ItemController.create);
router.put('/:id', validateItem, ItemController.update);
router.delete('/:id', ItemController.delete);

module.exports = router;