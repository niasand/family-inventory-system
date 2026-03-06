<template>
  <div class="modern-form">
    <!-- 页面头部 -->
    <div class="form-header">
      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </button>
      <h1 class="form-title">{{ isEdit ? '✏️ 编辑物品' : '✨ 新增物品' }}</h1>
      <p class="form-subtitle">
        {{ isEdit ? '更新物品的详细信息' : '记录您的新物品，让生活更有序' }}
      </p>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card glass-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="modern-form-content"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="section-icon">📋</span>
            基本信息
          </h3>
          
          <el-row :gutter="24">
            <el-col :span="24" :md="12">
              <el-form-item label="物品名称" prop="name">
                <input
                  v-model="form.name"
                  type="text"
                  class="modern-input"
                  placeholder="给物品起个名字"
                  maxlength="200"
                />
                <span class="char-count">{{ form.name.length }}/200</span>
              </el-form-item>
            </el-col>

            <el-col :span="24" :md="12">
              <el-form-item label="分类">
                <el-select
                  v-model="form.category"
                  placeholder="选择分类"
                  class="modern-select"
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="category in store.categories"
                    :key="category"
                    :label="category"
                    :value="category"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="图片链接">
            <input
              v-model="form.image"
              type="url"
              class="modern-input"
              placeholder="https://example.com/image.jpg（可选）"
            />
          </el-form-item>

          <el-form-item label="描述">
            <textarea
              v-model="form.description"
              class="modern-textarea"
              placeholder="描述一下这个物品..."
              rows="4"
              maxlength="1000"
            ></textarea>
            <span class="char-count">{{ form.description.length }}/1000</span>
          </el-form-item>
        </div>

        <!-- 时间和价格 -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="section-icon">📅</span>
            时间和价格
          </h3>

          <el-row :gutter="24">
            <el-col :span="24" :md="12">
              <el-form-item label="添加时间">
                <el-date-picker
                  v-model="form.added_at"
                  type="datetime"
                  placeholder="选择添加时间"
                  class="modern-date-picker"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24" :md="12">
              <el-form-item label="购买时间">
                <el-date-picker
                  v-model="form.purchased_at"
                  type="datetime"
                  placeholder="选择购买时间（可选）"
                  class="modern-date-picker"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="购买价格">
            <div class="price-input-wrapper">
              <span class="currency-symbol">¥</span>
              <input
                v-model.number="form.purchase_price"
                type="number"
                class="modern-input price-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </el-form-item>
        </div>

        <!-- 标签 -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="section-icon">🏷️</span>
            标签
          </h3>

          <el-form-item>
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              placeholder="添加标签"
              class="modern-select tags-select"
              :max-collapse-tags="3"
            >
              <el-option
                v-for="tag in store.tags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
            <p class="form-hint">💡 可以输入新标签或选择已有标签，最多10个</p>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button class="btn-secondary" @click="goBack">
            取消
          </button>
          <button 
            class="btn-primary" 
            :disabled="loading"
            @click="handleSubmit"
          >
            <span v-if="loading" class="btn-loading"></span>
            <span v-else>{{ isEdit ? '💾 保存修改' : '✨ 创建物品' }}</span>
          </button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useItemStore();

const formRef = ref();
const loading = ref(false);

const isEdit = computed(() => route.name === 'EditItem');
const itemId = computed(() => route.params.id);

const form = reactive({
  name: '',
  image: '',
  description: '',
  added_at: '',
  purchased_at: '',
  purchase_price: null,
  category: '',
  tags: []
});

const rules = {
  name: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 1, max: 200, message: '名称长度在 1-200 个字符', trigger: 'blur' }
  ]
};

const fetchItem = async () => {
  try {
    loading.value = true;
    const item = await store.fetchItem(itemId.value);
    
    Object.assign(form, {
      name: item.name,
      image: item.image || '',
      description: item.description || '',
      added_at: item.added_at ? formatDate(item.added_at) : '',
      purchased_at: item.purchased_at ? formatDate(item.purchased_at) : '',
      purchase_price: item.purchase_price,
      category: item.category || '',
      tags: item.tags || []
    });
  } catch (error) {
    ElMessage.error('获取物品信息失败: ' + error.message);
    router.push('/');
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
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

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    const formData = { ...form };
    
    // 处理日期格式
    if (formData.added_at) {
      const date = new Date(formData.added_at);
      if (!isNaN(date.getTime())) {
        formData.added_at = Math.floor(date.getTime());
      }
    }
    if (formData.purchased_at) {
      const date = new Date(formData.purchased_at);
      if (!isNaN(date.getTime())) {
        formData.purchased_at = Math.floor(date.getTime());
      }
    } else {
      delete formData.purchased_at;
    }

    if (isEdit.value) {
      await store.updateItem(itemId.value, formData);
      ElMessage.success('✅ 物品更新成功');
    } else {
      await store.createItem(formData);
      ElMessage.success('✅ 物品创建成功');
    }

    router.push('/');
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  store.fetchCategories();
  store.fetchTags();
  
  if (isEdit.value) {
    fetchItem();
  } else {
    // 设置默认添加时间为当前时间
    const now = new Date();
    form.added_at = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
});
</script>

<style scoped>
.modern-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.form-header {
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

.form-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #6b7280;
  font-size: 16px;
}

/* Glass Card */
.form-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.modern-form-content :deep(.el-form-item__label) {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 15px;
  padding-bottom: 8px;
}

/* Form Sections */
.form-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 20px;
}

/* Modern Inputs */
.modern-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  background: white;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.modern-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s;
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

/* Select */
.modern-select {
  width: 100%;
}

.modern-select :deep(.el-input__wrapper) {
  border-radius: 12px !important;
  box-shadow: 0 0 0 1px #e5e7eb inset !important;
  padding: 6px 12px !important;
}

.modern-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset !important;
}

.tags-select :deep(.el-select__tags) {
  flex-wrap: wrap;
}

/* Date Picker */
.modern-date-picker {
  width: 100%;
}

.modern-date-picker :deep(.el-input__wrapper) {
  border-radius: 12px !important;
  padding: 6px 12px !important;
}

/* Price Input */
.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.price-input {
  padding-left: 36px;
}

.form-hint {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 8px;
  margin-bottom: 0;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 14px 32px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-primary {
  padding: 14px 40px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
