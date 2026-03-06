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

  // 批量导入物品
  static async importItems(req, res) {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: '请提供有效的物品数组'
        });
      }
      
      const results = [];
      const errors = [];
      
      for (let i = 0; i < items.length; i++) {
        try {
          const item = await Item.create(items[i]);
          results.push(item);
        } catch (error) {
          errors.push({
            index: i,
            item: items[i],
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        data: {
          imported: results.length,
          failed: errors.length,
          items: results,
          errors: errors.length > 0 ? errors : undefined
        },
        message: `成功导入 ${results.length} 个物品${errors.length > 0 ? `，${errors.length} 个失败` : ''}`
      });
    } catch (error) {
      console.error('导入物品失败:', error);
      res.status(500).json({
        success: false,
        error: '导入物品失败',
        details: error.message
      });
    }
  }

  // 批量删除所有物品
  static async deleteAll(req, res) {
    try {
      const { confirm } = req.query;
      
      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: '请添加确认参数 ?confirm=true 以执行删除操作'
        });
      }
      
      // 获取所有物品并逐个删除
      const allItems = await Item.findAll(10000, 0);
      let deletedCount = 0;
      
      for (const item of allItems) {
        await Item.delete(item.id);
        deletedCount++;
      }
      
      res.json({
        success: true,
        message: `成功删除 ${deletedCount} 个物品`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('批量删除失败:', error);
      res.status(500).json({
        success: false,
        error: '批量删除失败',
        details: error.message
      });
    }
  }
}

module.exports = ItemController;
