/**
 * 家庭物品管理系统 API 自动化测试
 * 使用 Node.js 内置 fetch API (Node 18+)
 */

const BASE_URL = 'http://localhost:3000/api';

// 测试数据
const testItem = {
  name: '测试物品-API测试',
  description: '这是API自动化测试用的物品',
  category: '测试分类',
  tags: ['测试', 'API'],
  purchase_price: 999.99
};

// 断言函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ 断言失败: ${message}`);
  }
  console.log(`✅ ${message}`);
}

// 测试健康检查
async function testHealthCheck() {
  console.log('\n🧪 测试1: 健康检查接口');
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();
  
  assert(response.status === 200, '健康检查返回200状态码');
  assert(data.status === 'ok', '健康检查返回status为ok');
  assert(data.message.includes('家庭物品管理系统'), '健康检查消息包含系统名称');
}

// 测试获取物品列表
async function testGetItems() {
  console.log('\n🧪 测试2: 获取物品列表');
  const response = await fetch(`${BASE_URL}/items`);
  const data = await response.json();
  
  assert(response.status === 200, '获取列表返回200状态码');
  assert(data.success === true, '返回success为true');
  assert(Array.isArray(data.data), '返回data为数组');
  assert(data.pagination !== undefined, '返回包含分页信息');
}

// 测试创建物品
async function testCreateItem() {
  console.log('\n🧪 测试3: 创建物品');
  const response = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testItem)
  });
  const data = await response.json();
  
  assert(response.status === 201, '创建物品返回201状态码');
  assert(data.success === true, '创建成功返回success为true');
  assert(data.data.name === testItem.name, '创建的物品名称正确');
  assert(data.data.category === testItem.category, '创建的物品分类正确');
  
  return data.data.id; // 返回创建的ID用于后续测试
}

// 测试根据ID获取物品
async function testGetItemById(itemId) {
  console.log('\n🧪 测试4: 根据ID获取物品');
  const response = await fetch(`${BASE_URL}/items/${itemId}`);
  const data = await response.json();
  
  assert(response.status === 200, '获取单个物品返回200状态码');
  assert(data.success === true, '返回success为true');
  assert(data.data.id === itemId, '返回的物品ID正确');
}

// 测试更新物品
async function testUpdateItem(itemId) {
  console.log('\n🧪 测试5: 更新物品');
  const updateData = {
    name: '测试物品-已更新',
    description: '更新后的描述',
    purchase_price: 888.88
  };
  
  const response = await fetch(`${BASE_URL}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  const data = await response.json();
  
  assert(response.status === 200, '更新物品返回200状态码');
  assert(data.success === true, '更新成功返回success为true');
  assert(data.data.name === updateData.name, '更新后的名称正确');
  assert(data.data.purchase_price === updateData.purchase_price, '更新后的价格正确');
}

// 测试获取分类
async function testGetCategories() {
  console.log('\n🧪 测试6: 获取分类列表');
  const response = await fetch(`${BASE_URL}/items/categories`);
  const data = await response.json();
  
  assert(response.status === 200, '获取分类返回200状态码');
  assert(data.success === true, '返回success为true');
  assert(Array.isArray(data.data), '返回的分类是数组');
}

// 测试获取标签
async function testGetTags() {
  console.log('\n🧪 测试7: 获取标签列表');
  const response = await fetch(`${BASE_URL}/items/tags`);
  const data = await response.json();
  
  assert(response.status === 200, '获取标签返回200状态码');
  assert(data.success === true, '返回success为true');
  assert(Array.isArray(data.data), '返回的标签是数组');
}

// 测试删除物品
async function testDeleteItem(itemId) {
  console.log('\n🧪 测试8: 删除物品');
  const response = await fetch(`${BASE_URL}/items/${itemId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  
  assert(response.status === 200, '删除物品返回200状态码');
  assert(data.success === true, '删除成功返回success为true');
  
  // 验证已删除
  const getResponse = await fetch(`${BASE_URL}/items/${itemId}`);
  assert(getResponse.status === 404, '已删除的物品返回404');
}

// 测试数据导出
async function testBackupExport() {
  console.log('\n🧪 测试9: 数据导出');
  const response = await fetch(`${BASE_URL}/backup/export`);
  
  assert(response.status === 200, '导出数据返回200状态码');
  assert(response.headers.get('content-type').includes('application/json'), '返回JSON格式');
  
  const data = await response.json();
  assert(data.items !== undefined, '导出数据包含items字段');
}

// 测试错误处理 - 获取不存在的物品
async function testNotFound() {
  console.log('\n🧪 测试10: 错误处理-物品不存在');
  const response = await fetch(`${BASE_URL}/items/999999`);
  const data = await response.json();
  
  assert(response.status === 404, '不存在的物品返回404');
  assert(data.success === false, '返回success为false');
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始运行家庭物品管理系统 API 自动化测试\n');
  console.log('='.repeat(50));
  
  let createdItemId = null;
  let passed = 0;
  let failed = 0;
  
  const tests = [
    { name: '健康检查', fn: testHealthCheck },
    { name: '获取物品列表', fn: testGetItems },
    { 
      name: '创建物品', 
      fn: async () => { createdItemId = await testCreateItem(); }
    },
    { 
      name: '获取单个物品', 
      fn: async () => { if (createdItemId) await testGetItemById(createdItemId); }
    },
    { 
      name: '更新物品', 
      fn: async () => { if (createdItemId) await testUpdateItem(createdItemId); }
    },
    { name: '获取分类', fn: testGetCategories },
    { name: '获取标签', fn: testGetTags },
    { 
      name: '删除物品', 
      fn: async () => { if (createdItemId) await testDeleteItem(createdItemId); }
    },
    { name: '数据导出', fn: testBackupExport },
    { name: '错误处理', fn: testNotFound },
  ];
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} 测试失败:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed === 0) {
    console.log('🎉 所有测试通过！API 工作正常。');
    process.exit(0);
  } else {
    console.log('⚠️ 有测试失败，请检查 API 实现。');
    process.exit(1);
  }
}

// 执行测试
runTests().catch(error => {
  console.error('测试运行出错:', error);
  process.exit(1);
});
