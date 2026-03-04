const Joi = require('joi');

const itemSchema = Joi.object({
  name: Joi.string().required().min(1).max(200).messages({
    'string.empty': '物品名称不能为空',
    'string.min': '物品名称至少需要1个字符',
    'string.max': '物品名称最多200个字符',
    'any.required': '物品名称是必填项'
  }),
  image: Joi.string().uri().allow('').allow(null).messages({
    'string.uri': '图片必须是有效的 URL'
  }),
  description: Joi.string().max(1000).allow('').allow(null).messages({
    'string.max': '描述最多1000个字符'
  }),
  added_at: Joi.number().integer().allow(null),
  purchased_at: Joi.number().integer().allow(null),
  purchase_price: Joi.number().min(0).allow(null),
  category: Joi.string().max(100).allow('').allow(null).messages({
    'string.max': '分类最多100个字符'
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).allow(null).messages({
    'array.max': '最多10个标签',
    'string.max': '每个标签最多50个字符'
  })
});

const validateItem = (req, res, next) => {
  const { error, value } = itemSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      error: '数据验证失败',
      details: errors
    });
  }
  
  req.validatedBody = value;
  next();
};

module.exports = {
  validateItem,
  itemSchema
};
