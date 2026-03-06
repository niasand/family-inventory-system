import requests
import json
import pytest

# 加载配置文件
with open("config/config.json", "r") as f:
    config = json.load(f)

# 加载请求数据
with open("data/request_data.json", "r") as f:
    request_data = json.load(f)

# 加载响应数据
with open("data/response_data.json", "r") as f:
    response_data = json.load(f)

BASE_URL = config["host"] + config["base_path"]


class TestFamilyInventoryAPI:
    """家庭物品管理系统 API 测试套件"""
    
    @pytest.fixture(scope="function")
    def created_item_id(self):
        """Fixture：创建测试物品并返回ID，测试结束后删除"""
        # 创建测试物品
        item_data = request_data["create_item"]
        response = requests.post(f"{BASE_URL}/items", json=item_data)
        assert response.status_code == 201
        item_id = response.json()["data"]["id"]
        
        yield item_id
        
        # 清理：删除测试物品
        requests.delete(f"{BASE_URL}/items/{item_id}")
    
    # ==================== 健康检查测试 ====================
    
    def test_health_check(self):
        """测试健康检查接口"""
        response = requests.get(f"{BASE_URL}/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "家庭物品管理系统" in data["message"]
    
    # ==================== 物品管理接口测试 ====================
    
    def test_get_all_items_empty(self):
        """测试获取物品列表（空列表）"""
        response = requests.get(f"{BASE_URL}/items")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "pagination" in data
    
    def test_create_item(self):
        """测试创建物品"""
        item_data = request_data["create_item"]
        response = requests.post(f"{BASE_URL}/items", json=item_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == item_data["name"]
        assert data["data"]["category"] == item_data["category"]
        assert data["data"]["purchase_price"] == item_data["purchase_price"]
        
        # 清理
        item_id = data["data"]["id"]
        requests.delete(f"{BASE_URL}/items/{item_id}")
    
    def test_get_item_by_id(self, created_item_id):
        """测试根据ID获取物品"""
        response = requests.get(f"{BASE_URL}/items/{created_item_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == created_item_id
    
    def test_update_item(self, created_item_id):
        """测试更新物品"""
        update_data = request_data["update_item"]
        response = requests.put(f"{BASE_URL}/items/{created_item_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == update_data["name"]
        assert data["data"]["description"] == update_data["description"]
    
    def test_delete_item(self):
        """测试删除物品"""
        # 先创建物品
        item_data = request_data["create_item"]
        create_response = requests.post(f"{BASE_URL}/items", json=item_data)
        item_id = create_response.json()["data"]["id"]
        
        # 删除物品
        response = requests.delete(f"{BASE_URL}/items/{item_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # 验证已删除
        get_response = requests.get(f"{BASE_URL}/items/{item_id}")
        assert get_response.status_code == 404
    
    # ==================== 分类和标签接口测试 ====================
    
    def test_get_categories(self):
        """测试获取分类列表"""
        response = requests.get(f"{BASE_URL}/items/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
    
    def test_get_tags(self):
        """测试获取标签列表"""
        response = requests.get(f"{BASE_URL}/items/tags")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
    
    # ==================== 数据备份接口测试 ====================
    
    def test_backup_export(self):
        """测试数据导出"""
        response = requests.get(f"{BASE_URL}/backup/export")
        
        assert response.status_code == 200
        assert "application/json" in response.headers["Content-Type"]
        
        # 验证返回的是有效的JSON
        data = response.json()
        assert "items" in data
    
    def test_get_item_not_found(self):
        """测试获取不存在的物品（错误处理）"""
        response = requests.get(f"{BASE_URL}/items/999999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert "不存在" in data["error"] or "not found" in data["error"].lower()
    
    def test_create_item_validation_error(self):
        """测试创建物品时的参数验证（错误处理）"""
        # 缺少必填字段 name
        invalid_data = {
            "description": "没有名称的物品"
        }
        response = requests.post(f"{BASE_URL}/items", json=invalid_data)
        
        # 应该返回 400 或 422 错误
        assert response.status_code in [400, 422, 500]


class TestItemFilterAPI:
    """物品查询和筛选接口测试"""
    
    @pytest.fixture(scope="class")
    def setup_items(self):
        """设置测试数据：创建多个物品用于筛选测试"""
        items = []
        
        # 创建测试物品1 - 电子产品
        item1 = requests.post(f"{BASE_URL}/items", json={
            "name": "iPhone 15",
            "category": "电子产品",
            "tags": ["手机", "苹果"],
            "purchase_price": 6999.00
        }).json()["data"]
        items.append(item1["id"])
        
        # 创建测试物品2 - 电子产品
        item2 = requests.post(f"{BASE_URL}/items", json={
            "name": "MacBook Pro",
            "category": "电子产品",
            "tags": ["电脑", "苹果"],
            "purchase_price": 12999.00
        }).json()["data"]
        items.append(item2["id"])
        
        # 创建测试物品3 - 家具
        item3 = requests.post(f"{BASE_URL}/items", json={
            "name": "人体工学椅",
            "category": "家具",
            "tags": ["办公", "椅子"],
            "purchase_price": 1299.00
        }).json()["data"]
        items.append(item3["id"])
        
        yield items
        
        # 清理
        for item_id in items:
            requests.delete(f"{BASE_URL}/items/{item_id}")
    
    def test_filter_by_category(self, setup_items):
        """测试按分类筛选"""
        response = requests.get(f"{BASE_URL}/items", params={"category": "电子产品"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # 验证返回的物品都是电子产品
        for item in data["data"]:
            assert item["category"] == "电子产品"
    
    def test_filter_by_tags(self, setup_items):
        """测试按标签筛选"""
        response = requests.get(f"{BASE_URL}/items", params={"tags": "苹果"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # 验证返回的物品都包含苹果标签
        for item in data["data"]:
            assert "苹果" in item.get("tags", [])
    
    def test_search_by_name(self, setup_items):
        """测试按名称搜索"""
        response = requests.get(f"{BASE_URL}/items", params={"search": "iPhone"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # 验证返回的物品名称包含搜索关键词
        for item in data["data"]:
            assert "iPhone" in item["name"] or "iphone" in item["name"].lower()
    
    def test_pagination(self, setup_items):
        """测试分页功能"""
        # 请求第一页，每页2条
        response = requests.get(f"{BASE_URL}/items", params={"page": 1, "limit": 2})
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) <= 2
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["limit"] == 2
