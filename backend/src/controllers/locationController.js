const Location = require('../models/location');

class LocationController {
  static async getAll(req, res) {
    try {
      const locations = await Location.findAll();
      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('获取位置列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取位置列表失败',
        details: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findById(id);
      
      if (!location) {
        return res.status(404).json({
          success: false,
          error: '位置不存在'
        });
      }
      
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('获取位置详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取位置详情失败',
        details: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const locationData = req.validatedBody;
      
      // 检查名称是否已存在
      const existing = await Location.findByName(locationData.name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: '位置名称已存在'
        });
      }
      
      const newLocation = await Location.create(locationData);
      
      res.status(201).json({
        success: true,
        data: newLocation,
        message: '位置创建成功'
      });
    } catch (error) {
      console.error('创建位置失败:', error);
      res.status(500).json({
        success: false,
        error: '创建位置失败',
        details: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      
      // 如果修改了名称，检查是否与其他位置冲突
      if (updateData.name) {
        const existing = await Location.findByName(updateData.name);
        if (existing && existing.id !== id) {
          return res.status(409).json({
            success: false,
            error: '位置名称已存在'
          });
        }
      }
      
      const updatedLocation = await Location.update(id, updateData);
      
      if (!updatedLocation) {
        return res.status(404).json({
          success: false,
          error: '位置不存在'
        });
      }
      
      res.json({
        success: true,
        data: updatedLocation,
        message: '位置更新成功'
      });
    } catch (error) {
      console.error('更新位置失败:', error);
      res.status(500).json({
        success: false,
        error: '更新位置失败',
        details: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Location.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: '位置不存在'
        });
      }
      
      res.json({
        success: true,
        message: '位置删除成功'
      });
    } catch (error) {
      console.error('删除位置失败:', error);
      res.status(500).json({
        success: false,
        error: '删除位置失败',
        details: error.message
      });
    }
  }

  // 获取物品数量统计
  static async getItemCounts(req, res) {
    try {
      const counts = await Location.getItemCounts();
      res.json({
        success: true,
        data: counts
      });
    } catch (error) {
      console.error('获取位置物品统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取位置物品统计失败',
        details: error.message
      });
    }
  }
}

module.exports = LocationController;
