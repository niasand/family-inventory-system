<template>
  <div class="item-detail">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">物品详情</span>
      </template>
    </el-page-header>

    <el-row :gutter="16" class="action-buttons">
      <el-col :span="24" class="text-right">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="item-content">
      <el-col :xs="24" :md="8">
        <div class="image-section">
          <div class="image-container">
            <el-image
              v-if="item.image"
              :src="item.image"
              fit="cover"
              class="item-image"
              :preview-src-list="[item.image]"
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
        </div>
      </el-col>
      <el-col :xs="24" :md="16">
        <div class="info-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <h2 class="item-name">{{ item.name }}</h2>
                <div class="item-meta">
                  <el-tag v-if="item.category" size="large">{{ item.category }}</el-tag>
                  <span class="price" v-if="item.purchase_price">
                    ¥{{ item.purchase_price.toFixed(2) }}
                  </span>
                </div>
              </div>
            </template>

            <div class="detail-grid">
              <div class="detail-item">
                <label>添加时间：</label>
                <span>{{ formatDate(item.added_at) }}</span>
              </div>
              <div class="detail-item" v-if="item.purchased_at">
                <label>购买时间：</label>
                <span>{{ formatDate(item.purchased_at) }}</span>
              </div>
              <div class="detail-item" v-if="item.purchase_price">
                <label>购买价格：</label>
                <span class="price">¥{{ item.purchase_price.toFixed(2) }}</span>
              </div>
            </div>

            <div class="tags-section" v-if="item.tags && item.tags.length">
              <label>标签：</label>
              <div class="tags">
                <el-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <div class="description-section" v-if="item.description">
              <label>描述：</label>
              <div class="description">{{ item.description }}</div>
            </div>

            <div class="created-info">
              <p>创建时间：{{ formatDateTime(item.created_at) }}</p>
              <p>更新时间：{{ formatDateTime(item.updated_at) }}</p>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Picture, Box } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useItemStore();

const item = ref({
  id: '',
  name: '',
  image: '',
  description: '',
  added_at: '',
  purchased_at: '',
  purchase_price: null,
  category: '',
  tags: [],
  created_at: '',
  updated_at: ''
});

const fetchItem = async () => {
  try {
    store.loading = true;
    const data = await store.fetchItem(route.params.id);
    item.value = data;
  } catch (error) {
    ElMessage.error('获取物品信息失败: ' + error.message);
    router.push('/');
  } finally {
    store.loading = false;
  }
};

const handleEdit = () => {
  router.push(`/item/${route.params.id}/edit`);
};

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除这个物品吗？此操作不可恢复。',
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteItem();
  }).catch(() => {
    // 用户取消删除
  });
};

const deleteItem = async () => {
  try {
    await store.deleteItem(route.params.id);
    ElMessage.success('物品删除成功');
    router.push('/');
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message);
  }
};

const goBack = () => {
  router.push('/');
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(() => {
  fetchItem();
});
</script>

<style scoped>
.item-detail {
  padding: 24px 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  margin-bottom: 24px;
}

.text-right {
  text-align: right;
}

.item-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.image-section {
  display: flex;
  align-items: center;
}

.image-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}

.item-image {
  width: 100%;
  height: 100%;
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

.info-section {
  margin-left: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 18px;
}

.detail-grid {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 100px;
}

.detail-item span {
  color: #303133;
}

.tags-section {
  margin-bottom: 24px;
}

.tags-section label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  display: block;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.description-section {
  margin-bottom: 24px;
}

.description-section label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  display: block;
  margin-bottom: 8px;
}

.description {
  color: #606266;
  line-height: 1.6;
}

.created-info {
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

.created-info p {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .item-content {
    padding: 16px;
  }
  
  .image-section {
    margin-bottom: 16px;
  }
  
  .info-section {
    margin-left: 0;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .item-name {
    font-size: 20px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-item label {
    min-width: auto;
    margin-bottom: 4px;
  }
}
</style>
