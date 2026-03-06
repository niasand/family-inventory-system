<template>
  <div class="backup-management">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">数据管理</span>
      </template>
    </el-page-header>

    <el-row :gutter="16" class="stats-section">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="48"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ store.total }}</h3>
              <p>物品总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="48"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ categoriesCount }}</h3>
              <p>分类数量</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="48"><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ tagsCount }}</h3>
              <p>标签数量</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="backup-section">
      <el-col :xs="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据导出</span>
              <el-button type="primary" @click="exportData" :loading="exporting">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
          </template>
          
          <div class="export-info">
            <el-alert
              title="导出数据说明"
              type="info"
              description="导出数据将包含所有物品信息，可用于备份或迁移。导出的 JSON 文件包含物品的完整数据。"
              show-icon
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="import-section">
      <el-col :xs="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据导入</span>
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="false"
                accept=".json"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  选择文件
                </el-button>
              </el-upload>
            </div>
          </template>

          <div class="import-content">
            <div class="upload-area" v-if="!selectedFile">
              <el-empty description="请选择要导入的 JSON 文件">
                <template #image>
                  <el-icon :size="64"><Document /></el-icon>
                </template>
              </el-empty>
              <p class="upload-tip">
                支持 JSON 格式的数据文件，文件大小不超过 10MB
              </p>
            </div>

            <div v-else class="file-info">
              <div class="file-details">
                <el-icon><Document /></el-icon>
                <span>{{ selectedFile.name }}</span>
                <el-tag size="small" type="success">{{ formatFileSize(selectedFile.size) }}</el-tag>
              </div>
              
              <div class="import-options">
                <el-checkbox v-model="overwriteMode">
                  覆盖现有数据（清空现有物品后导入）
                </el-checkbox>
              </div>

              <div class="import-actions">
                <el-button type="primary" @click="importData" :loading="importing">
                  <el-icon><Upload /></el-icon>
                  开始导入
                </el-button>
                <el-button @click="cancelUpload">取消</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Box, FolderOpened, Collection, Download, Upload, Document } from '@element-plus/icons-vue';

const router = useRouter();
const store = useItemStore();
const uploadRef = ref();

const exporting = ref(false);
const importing = ref(false);
const selectedFile = ref(null);
const overwriteMode = ref(false);

const categoriesCount = computed(() => store.categories.length);
const tagsCount = computed(() => store.tags.length);

const exportData = async () => {
  try {
    exporting.value = true;
    await store.fetchItems();
    await store.fetchCategories();
    await store.fetchTags();
    
    const response = await fetch('/api/backup/export');
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    ElMessage.success('数据导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  } finally {
    exporting.value = false;
  }
};

const handleFileChange = (file) => {
  selectedFile.value = file.raw;
};

const importData = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要导入的文件');
    return;
  }

  try {
    importing.value = true;
    
    const reader = new FileReader();
    const text = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(selectedFile.value);
    });

    const data = JSON.parse(text);
    
    ElMessageBox.confirm(
      `确定要导入 ${Array.isArray(data.items) ? data.items.length : 0} 个物品吗？${overwriteMode.value ? '这将覆盖现有数据。' : ''}`,
      '确认导入',
      {
        confirmButtonText: '导入',
        cancelButtonText: '取消',
        type: overwriteMode.value ? 'warning' : 'info',
      }
    ).then(async () => {
      await store.importData(data, overwriteMode.value);
      ElMessage.success('数据导入成功');
      cancelUpload();
    }).catch(() => {
      // 用户取消导入
    });
    
  } catch (error) {
    ElMessage.error('导入失败: ' + error.message);
  } finally {
    importing.value = false;
  }
};

const cancelUpload = () => {
  selectedFile.value = null;
  uploadRef.value?.clearFiles();
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  // 加载统计信息
  store.fetchItems();
  store.fetchCategories();
  store.fetchTags();
});
</script>

<style scoped>
.backup-management {
  padding: 24px 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #ecf5ff;
  border-radius: 8px;
  color: #409eff;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.backup-section,
.import-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-info {
  margin-bottom: 16px;
}

.import-content {
  padding: 16px 0;
}

.upload-area {
  text-align: center;
  padding: 40px 0;
}

.upload-tip {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.file-details .el-icon {
  font-size: 20px;
  color: #409eff;
}

.import-options {
  padding: 12px;
  background: #fff7e6;
  border-radius: 4px;
  border: 1px solid #ffd591;
}

.import-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .import-actions {
    justify-content: center;
  }
}
</style>
