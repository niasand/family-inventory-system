<template>
  <div class="item-list">
    <el-row :gutter="16" class="filters-row">
      <el-col :xs="24" :sm="8" :md="8">
        <el-input
          v-model="searchQuery"
          placeholder="搜索物品名称、描述、分类"
          :prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
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
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-select
          v-model="selectedTag"
          placeholder="选择标签"
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
      </el-col>
      <el-col :xs="24" :sm="24" :md="4" class="text-right">
        <el-button type="primary" @click="loadItems">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </el-col>
    </el-row>

    <el-divider />

    <div v-if="store.loading" class="text-center" style="padding: 40px">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <el-empty description="暂无物品，点击上方「新增物品」开始添加">
        <el-button type="primary" @click="$router.push('/new')">
          立即添加
        </el-button>
      </el-empty>
    </div>

    <el-row v-else :gutter="16">
      <el-col
        v-for="item in filteredItems"
        :key="item.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="item-card" shadow="hover" @click="viewItem(item.id)">
          <div class="item-image">
            <el-image
              v-if="item.image"
              :src="item.image"
              fit="cover"
              :lazy="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder">
              <el-icon><Box /></el-icon>
            </div>
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p v-if="item.category" class="item-category">
              <el-tag size="small">{{ item.category }}</el-tag>
            </p>
            <div v-if="item.tags && item.tags.length" class="item-tags">
              <el-tag
                v-for="tag in item.tags"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
            <p v-if="item.purchase_price" class="item-price">
              ¥{{ item.purchase_price.toFixed(2) }}
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div v-if="!store.loading && total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Loading, Picture, Box } from '@element-plus/icons-vue';

const router = useRouter();
const store = useItemStore();

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedTag = ref('');
const currentPage = ref(1);
const pageSize = 12;

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
  
  return result;
});

const total = computed(() => store.total);

const loadItems = async () => {
  try {
    await Promise.all([
      store.fetchItems(currentPage.value),
      store.fetchCategories(),
      store.fetchTags()
    ]);
  } catch (error) {
    ElMessage.error('加载失败: ' + error.message);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadItems();
};

const handleFilter = () => {
  currentPage.value = 1;
  loadItems();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadItems();
};

const viewItem = (id) => {
  router.push(`/item/${id}`);
};

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
.item-list {
  padding: 0;
}

.filters-row {
  align-items: center;
  margin-bottom: 16px;
}

.text-right {
  text-align: right;
}

.empty-state {
  padding: 40px 0;
}

.item-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-4px);
}

.item-image {
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-error,
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.image-error .el-icon,
.image-placeholder .el-icon {
  font-size: 48px;
}

.item-info {
  padding-top: 16px;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-category {
  margin: 0 0 8px 0;
}

.item-tags {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-tags .el-tag {
  margin: 0;
}

.item-price {
  margin: 0;
  color: #f56c6c;
  font-weight: 600;
  font-size: 14px;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}
</style>
