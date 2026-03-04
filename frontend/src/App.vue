<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="24"><Box /></el-icon>
          <h1>家庭物品管理系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="header-menu"
          mode="horizontal"
          :ellipsis="false"
        >
          <el-menu-item index="/" @click="$router.push('/')">
            <el-icon><List /></el-icon>
            物品列表
          </el-menu-item>
          <el-menu-item index="/new" @click="$router.push('/new')">
            <el-icon><Plus /></el-icon>
            新增物品
          </el-menu-item>
          <el-menu-item index="/backup" @click="$router.push('/backup')">
            <el-icon><FolderOpened /></el-icon>
            数据管理
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Box, List, Plus, FolderOpened } from '@element-plus/icons-vue';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-menu {
  border-bottom: none;
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 12px;
  }
  
  .header-menu {
    width: 100%;
    margin-top: 12px;
  }
  
  .app-main {
    padding: 16px;
  }
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
