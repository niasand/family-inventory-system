<template>
  <div class="item-form">
    <el-page-header @back="goBack" title="返回列表">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑物品' : '新增物品' }}</span>
      </template>
    </el-page-header>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="form-container"
      size="default"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="物品名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入物品名称"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select
              v-model="form.category"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <el-option
                v-for="category in store.categories"
                :key="category"
                :label="category"
                :value="category"
              />
              <el-option label="其他" value="" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="图片链接">
        <el-input
          v-model="form.image"
          placeholder="请输入图片链接（可选）"
          clearable
        />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入物品描述"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="添加时间">
            <el-date-picker
              v-model="form.added_at"
              type="datetime"
              placeholder="请选择添加时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买时间">
            <el-date-picker
              v-model="form.purchased_at"
              type="datetime"
              placeholder="请选择购买时间（可选）"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="购买价格">
        <el-input-number
          v-model="form.purchase_price"
          :precision="2"
          :min="0"
          placeholder="请输入购买价格（可选）"
          style="width: 200px"
        />
        <span style="margin-left: 8px; color: #909399">元</span>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          placeholder="请选择标签"
          style="width: 100%"
          collapse-tags
          collapse-tags-tooltip
          max-collapse-tags="3"
        >
          <el-option
            v-for="tag in store.tags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        <div style="margin-top: 8px; color: #909399; font-size: 12px">
          最多可选择10个标签
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新物品' : '创建物品' }}
        </el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemStore } from '../store/itemStore';
import { ElMessage } from 'element-plus';

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
    { min: 1, max: 200, message: '物品名称长度在 1 到 200 个字符', trigger: 'blur' }
  ]
};

const fetchCategories = async () => {
  try {
    await store.fetchCategories();
  } catch (error) {
    ElMessage.error('获取分类失败: ' + error.message);
  }
};

const fetchTags = async () => {
  try {
    await store.fetchTags();
  } catch (error) {
    ElMessage.error('获取标签失败: ' + error.message);
  }
};

const fetchItem = async () => {
  try {
    loading.value = true;
    const item = await store.fetchItem(itemId.value);
    
    Object.assign(form, {
      name: item.name,
      image: item.image || '',
      description: item.description || '',
      added_at: item.added_at ? new Date(item.added_at).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : '',
      purchased_at: item.purchased_at ? new Date(item.purchased_at).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : '',
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

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    // 处理日期格式
    const formData = { ...form };
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
      ElMessage.success('物品更新成功');
    } else {
      await store.createItem(formData);
      ElMessage.success('物品创建成功');
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
  fetchCategories();
  fetchTags();
  
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
.item-form {
  padding: 24px 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-button {
  margin-right: 12px;
}

.el-button:last-child {
  margin-right: 0;
}
</style>
