const Item = require('../models/item');
const { validateItem } = require('../middleware/validator');

class ItemController {
  static async getAll(req, res) {
    try {
      const { search, category, tags, status, location, limit = 50, page = 1 } = req.query;
      
      const offset = (page - 1) * limit;
      const filters = { search, category, tags, status, location };
      
      const items = await Item.findAll(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );
      
      const total = await Item.count(filters);
      
      res.json({
        success: true,
        data: items,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取物品列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取物品列表失败',
        details: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await Item.findById(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: '物品不存在'
        });
      }
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('获取物品详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取物品详情失败',
        details: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const itemData = req.validatedBody;
      
      const newItem = await Item.create(itemData);
      
      res.status(201).json({
        success: true,
        data: newItem,
        message: '物品创建成功'
      });
    } catch (error) {
      console.error('创建物品失败:', error);
      res.status(500).json({
        success: false,
        error: '创建物品失败',
        details: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      
      const updatedItem = await Item.update(id, updateData);
      
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          error: '物品不存在'
        });
      }
      
      res.json({
        success: true,
        data: updatedItem,
        message: '物品更新成功'
      });
    } catch (error) {
      console.error('更新物品失败:', error);
      res.status(500).json({
        success: false,
        error: '更新物品失败',
        details: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Item.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: '物品不存在'
        });
      }
      
      res.json({
        success: true,
        message: '物品删除成功'
      });
    } catch (error) {
      console.error('删除物品失败:', error);
      res.status(500).json({
        success: false,
        error: '删除物品失败',
        details: error.message
      });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Item.getCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('获取分类失败:', error);
      res.status(500).json({
        success: false,
        error: '获取分类失败',
        details: error.message
      });
    }
  }

  static async getTags(req, res) {
    try {
      const tags = await Item.getTags();
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('获取标签失败:', error);
      res.status(500).json({
        success: false,
        error: '获取标签失败',
        details: error.message
      });
    }
  }

  // 获取状态列表
  static async getStatuses(req, res) {
    try {
      const statuses = await Item.getStatuses();
      res.json({
        success: true,
        data: statuses
      });
    } catch (error) {
      console.error('获取状态列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取状态列表失败',
        details: error.message
      });
    }
  }
}

module.exports = ItemController;
