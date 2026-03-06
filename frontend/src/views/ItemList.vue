<template>
  <div class="modern-list">
    <!-- 搜索和筛选栏 -->
    <div class="search-section glass-card">
      <div class="search-input-wrapper">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          v-model="searchQuery"
          type="text"
          class="modern-search"
          placeholder="搜索物品名称、描述、分类..."
          @keyup.enter="handleSearch"
        />
        <button 
          v-if="searchQuery"
          class="clear-btn"
          @click="clearSearch"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="filter-chips">
        <div class="filter-chip" :class="{ active: selectedCategory }">
          <el-select
            v-model="selectedCategory"
            placeholder="📁 分类筛选"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="category in store.categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </div>

        <div class="filter-chip" :class="{ active: selectedTag }">
          <el-select
            v-model="selectedTag"
            placeholder="🏷️ 标签筛选"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="tag in store.tags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>

        <div class="filter-chip" :class="{ active: selectedLocation }">
          <el-select
            v-model="selectedLocation"
            placeholder="📍 位置筛选"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="location in store.locations"
              :key="location.id"
              :label="location.name"
              :value="location.name"
            />
          </el-select>
        </div>

        <div class="filter-chip" :class="{ active: selectedStatus }">
          <el-select
            v-model="selectedStatus"
            placeholder="🔹 状态筛选"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="status in store.statuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </div>

        <button class="refresh-btn" @click="loadItems">
          <el-icon :class="{ 'is-loading': store.loading }"><Refresh /></el-icon>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card glass-card">
        <div class="stat-icon blue">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ store.total }}</span>
          <span class="stat-label">物品总数</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon purple">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ store.categories.length }}</span>
          <span class="stat-label">分类数量</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon orange">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ store.tags.length }}</span>
          <span class="stat-label">标签数量</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon green">
          <el-icon><Location /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ store.locations.length }}</span>
          <span class="stat-label">存放位置</span>
        </div>
      </div>
    </div>

    <!-- 物品列表 -->
    <div v-if="store.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载物品...⏳</p>
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" class="empty-svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.3" />
            </linearGradient>
          </defs>
          <rect x="40" y="60" width="120" height="100" rx="10" fill="url(#grad1)" />
          <rect x="55" y="45" width="90" height="20" rx="5" fill="#667eea" opacity="0.5" />
          <circle cx="100" cy="110" r="25" fill="#667eea" opacity="0.3" />
          <path d="M90 105 L100 115 L115 95" stroke="#667eea" stroke-width="3" fill="none" />
        </svg>
      </div>
      <h3>暂无物品</h3>
      <p>开始记录您的第一件物品吧！📦</p>
      <el-button type="primary" class="add-first-btn" @click="$router.push('/new')">
        <el-icon><Plus /></el-icon>
        添加第一件物品
      </el-button>
    </div>

    <div v-else class="items-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card glass-card"
        @click="viewItem(item.id)"
      >
        <div class="item-image">
          <el-image v-if="item.image" :src="item.image" fit="cover">
            <template #error>
              <div class="image-fallback">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="image-fallback">
            <el-icon :size="32"><Box /></el-icon>
          </div>
          <div v-if="item.purchase_price" class="price-tag">
            ¥{{ formatPrice(item.purchase_price) }}
          </div>
          <!-- 状态标签 -->
          <div v-if="item.status" class="status-tag" :style="getStatusStyle(item.status)">
            {{ getStatusLabel(item.status) }}
          </div>
        </div>

        <div class="item-content">
          <h3 class="item-name">{{ item.name }}</h3>
          
          <div class="item-meta">
            <span v-if="item.category" class="category-badge">{{ item.category }}</span>
            <span v-if="item.location" class="location-badge">{{ item.location }}</span>
          </div>

          <div v-if="item.tags && item.tags.length" class="item-tags">
            <span 
              v-for="tag in item.tags.slice(0, 3)" 
              :key="tag"
              class="tag-pill"
            >
              {{ tag }}
            </span>
            <span v-if="item.tags.length > 3" class="tag-more">
              +{{ item.tags.length - 3 }}
            </span>
          </div>

          <p v-if="item.description" class="item-desc">
            {{ truncateDesc(item.description) }}
          </p>

          <div class="item-pricing">
            <span v-if="item.holding_days !== undefined" class="holding-days">
              📅 {{ item.holding_days }}天
            </span>
            <span v-if="item.holding_cost > 0" class="holding-cost">
              💰 日均¥{{ item.holding_cost }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { Search, Refresh, Box, Folder, Collection, Plus, Picture, Close, Location } from '@element-plus/icons-vue';

const router = useRouter();
const store = useItemStore();

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedTag = ref('');
const selectedLocation = ref('');
const selectedStatus = ref('');

const filteredItems = computed(() => {
  let result = [...store.items];
  
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm))
    );
  }
  
  if (selectedCategory.value) {
    result = result.filter(item => item.category === selectedCategory.value);
  }
  
  if (selectedTag.value) {
    result = result.filter(item => 
      item.tags && item.tags.includes(selectedTag.value)
    );
  }
  
  if (selectedLocation.value) {
    result = result.filter(item => item.location === selectedLocation.value);
  }
  
  if (selectedStatus.value) {
    result = result.filter(item => item.status === selectedStatus.value);
  }
  
  return result;
});

const loadItems = async () => {
  await Promise.all([
    store.fetchItems(),
    store.fetchCategories(),
    store.fetchTags(),
    store.fetchLocations(),
    store.fetchStatuses()
  ]);
};

const handleSearch = () => {
  loadItems();
};

const handleFilter = () => {
  loadItems();
};

const clearSearch = () => {
  searchQuery.value = '';
  handleSearch();
};

const viewItem = (id) => {
  router.push(`/item/${id}`);
};

const formatPrice = (price) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const truncateDesc = (desc) => {
  if (desc.length <= 50) return desc;
  return desc.substring(0, 50) + '...';
};

// 获取状态标签样式
const getStatusStyle = (statusValue) => {
  const status = store.statuses.find(s => s.value === statusValue);
  if (status && status.color) {
    return { 
      backgroundColor: status.color + '33',
      color: status.color,
      borderColor: status.color + '80'
    };
  }
  return {};
};

// 获取状态标签显示名称
const getStatusLabel = (statusValue) => {
  const status = store.statuses.find(s => s.value === statusValue);
  return status ? status.label : statusValue;
};

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
.modern-list {
  max-width: 1400px;
  margin: 0 auto;
}

/* Glass Card Style */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Search Section */
.search-section {
  padding: 24px;
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #667eea;
}

.modern-search {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 16px;
  background: rgba(102, 126, 234, 0.05);
  transition: all 0.3s ease;
}

.modern-search:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

/* Filter Chips */
.filter-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-chip {
  position: relative;
}

.filter-chip :deep(.el-select) {
  width: 180px;
}

.filter-chip :deep(.el-input__wrapper) {
  border-radius: 10px !important;
  background: rgba(102, 126, 234, 0.05) !important;
  border: 2px solid transparent !important;
  transition: all 0.3s !important;
}

.filter-chip :deep(.el-input__wrapper:hover) {
  border-color: #667eea !important;
}

.filter-chip.active :deep(.el-input__wrapper) {
  background: rgba(102, 126, 234, 0.1) !important;
  border-color: #667eea !important;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a 0%, #67c23a 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  margin: 0 auto 32px;
}

.empty-svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 22px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.add-first-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 14px 28px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.item-image {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8eaff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #667eea;
  font-size: 32px;
}

.price-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 状态标签 */
.status-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid;
}

.item-content {
  padding: 20px;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 10px;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.category-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.location-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(60, 179, 113, 0.1);
  color: #3cb371;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-pill {
  padding: 3px 10px;
  background: rgba(118, 75, 162, 0.1);
  color: #764ba2;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.tag-more {
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
  border-radius: 12px;
  font-size: 11px;
}

.item-desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.item-pricing {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
}

.holding-days {
  color: #667eea;
  font-weight: 500;
}

.holding-cost {
  color: #f59e0b;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .search-section {
    padding: 16px;
  }

  .filter-chips {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-chip :deep(.el-select) {
    width: 100%;
  }

  .refresh-btn {
    margin-left: 0;
    justify-content: center;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
