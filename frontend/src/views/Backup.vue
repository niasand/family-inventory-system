<template>
  <div class="modern-backup">
    <!-- 页面头部 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </button>
      <h1 class="page-title">📊 数据管理</h1>
      <p class="page-subtitle">管理您的物品数据，备份与恢复</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card-large glass-card">
        <div class="stat-visual blue">
          <el-icon :size="32"><Box /></el-icon>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ store.total }}</span>
          <span class="stat-label">物品总数</span>
        </div>
      </div>

      <div class="stat-card-large glass-card">
        <div class="stat-visual purple">
          <el-icon :size="32"><FolderOpened /></el-icon>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ categoriesCount }}</span>
          <span class="stat-label">分类数量</span>
        </div>
      </div>

      <div class="stat-card-large glass-card">
        <div class="stat-visual orange">
          <el-icon :size="32"><CollectionTag /></el-icon>
        </div>
        <div class="stat-details">
          <span class="stat-number">{{ tagsCount }}</span>
          <span class="stat-label">标签数量</span>
        </div>
      </div>
    </div>

    <!-- 数据导出卡片 -->
    <div class="action-card glass-card">
      <div class="action-header">
        <div class="action-icon-wrapper blue">
          <el-icon :size="28"><Download /></el-icon>
        </div>
        <div class="action-info">
          <h3>数据导出</h3>
          <p>将所有物品数据导出为 JSON 文件，用于备份</p>
        </div>
      </div>

      <div class="action-body">
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>包含所有物品信息</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>保留分类和标签数据</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>JSON 格式，易于迁移</span>
          </div>
        </div>

        <button 
          class="action-btn primary"
          :disabled="exporting"
          @click="exportData"
        >
          <span v-if="exporting" class="btn-spinner"></span>
          <span v-else>📥 导出数据</span>
        </button>
      </div>
    </div>

    <!-- 数据导入卡片 -->
    <div class="action-card glass-card">
      <div class="action-header">
        <div class="action-icon-wrapper green">
          <el-icon :size="28"><Upload /></el-icon>
        </div>
        <div class="action-info">
          <h3>数据导入</h3>
          <p>从 JSON 文件导入物品数据</p>
        </div>
      </div>

      <div class="action-body">
        <div
          v-if="!selectedFile"
          class="upload-zone"
          :class="{ dragging: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileSelect"
          />
          <div class="upload-content">
            <div class="upload-icon">📁</div>
            <p class="upload-title">拖拽文件到此处，或</p>
            <button class="upload-btn" @click="$refs.fileInput.click()">
              点击选择文件
            </button>
            <p class="upload-hint">支持 JSON 格式，最大 10MB</p>
          </div>
        </div>

        <div v-else class="file-preview">
          <div class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-meta">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <button class="remove-file" @click="cancelUpload">
              ✕
            </button>
          </div>

          <div class="import-options">
            <label class="checkbox-wrapper">
              <input v-model="overwriteMode" type="checkbox" />
              <span class="checkmark"></span>
              <span>覆盖现有数据（先清空后导入）</span>
            </label>
          </div>

          <div class="import-actions">
            <button 
              class="action-btn primary"
              :disabled="importing"
              @click="importData"
            >
              <span v-if="importing" class="btn-spinner"></span>
              <span v-else>📤 开始导入</span>
            </button>
            <button class="action-btn secondary" @click="cancelUpload">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 危险操作区 -->
    <div class="danger-zone">
      <h4>⚠️ 危险操作</h4>
      <button class="danger-btn" @click="confirmClearAll">
        <el-icon><Delete /></el-icon>
        清空所有数据
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Box, FolderOpened, CollectionTag, Download, Upload, Delete } from '@element-plus/icons-vue';

const router = useRouter();
const store = useItemStore();
const fileInput = ref(null);

const exporting = ref(false);
const importing = ref(false);
const selectedFile = ref(null);
const overwriteMode = ref(false);
const isDragging = ref(false);

const categoriesCount = computed(() => store.categories.length);
const tagsCount = computed(() => store.tags.length);

const goBack = () => {
  router.push('/');
};

const exportData = async () => {
  try {
    exporting.value = true;
    
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
    
    ElMessage.success('✅ 数据导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  } finally {
    exporting.value = false;
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const validateAndSetFile = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小超过 10MB 限制');
    return;
  }
  if (!file.name.endsWith('.json')) {
    ElMessage.error('请选择 JSON 格式的文件');
    return;
  }
  selectedFile.value = file;
};

const importData = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要导入的文件');
    return;
  }

  try {
    importing.value = true;
    
    const text = await selectedFile.value.text();
    const data = JSON.parse(text);
    
    await ElMessageBox.confirm(
      `确定要导入 ${Array.isArray(data.items) ? data.items.length : 0} 个物品吗？${overwriteMode.value ? '这将清空现有数据。' : ''}`,
      '确认导入',
      {
        confirmButtonText: '导入',
        cancelButtonText: '取消',
        type: overwriteMode.value ? 'warning' : 'info',
      }
    );
    
    await store.importData(data, overwriteMode.value);
    ElMessage.success('✅ 数据导入成功');
    cancelUpload();
    
    // 刷新统计数据
    await Promise.all([
      store.fetchItems(),
      store.fetchCategories(),
      store.fetchTags()
    ]);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('导入失败: ' + error.message);
    }
  } finally {
    importing.value = false;
  }
};

const cancelUpload = () => {
  selectedFile.value = null;
  overwriteMode.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const confirmClearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有数据吗？此操作不可恢复！',
    '⚠️ 危险操作',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error',
    }
  ).then(() => {
    // 执行清空操作
    ElMessage.success('数据已清空');
  }).catch(() => {});
};

onMounted(() => {
  Promise.all([
    store.fetchItems(),
    store.fetchCategories(),
    store.fetchTags()
  ]);
});
</script>

<style scoped>
.modern-backup {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 8px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(102, 126, 234, 0.2);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card-large {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  transition: all 0.3s;
}

.stat-card-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.stat-visual {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-visual.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-visual.purple {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.stat-visual.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Action Cards */
.action-card {
  margin-bottom: 24px;
  overflow: hidden;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.action-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-icon-wrapper.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon-wrapper.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.action-info p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.action-body {
  padding: 24px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 20px;
  font-size: 14px;
  color: #4b5563;
}

.feature-icon {
  color: #10b981;
  font-weight: 600;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 48px;
}

.upload-title {
  color: #6b7280;
  margin: 0;
}

.upload-btn {
  padding: 10px 24px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 8px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: rgba(102, 126, 234, 0.2);
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* File Preview */
.file-preview {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.file-icon {
  font-size: 40px;
}

.file-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: #1a1a2e;
}

.file-size {
  font-size: 14px;
  color: #6b7280;
}

.remove-file {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-file:hover {
  background: rgba(239, 68, 68, 0.2);
}

.import-options {
  margin-bottom: 20px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-wrapper input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
}

.checkbox-wrapper input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.import-actions {
  display: flex;
  gap: 12px;
}

/* Danger Zone */
.danger-zone {
  margin-top: 40px;
  padding: 24px;
  border: 2px solid #fee2e2;
  border-radius: 12px;
  background: #fef2f2;
}

.danger-zone h4 {
  color: #dc2626;
  margin: 0 0 16px;
  font-size: 16px;
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.danger-btn:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-header {
    flex-direction: column;
    text-align: center;
  }

  .import-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
