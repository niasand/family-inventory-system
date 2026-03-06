<template>
  <div class="modern-app">
    <!-- 顶部导航 -->
    <header class="glass-header">
      <div class="header-container">
        <div class="brand">
          <div class="logo-icon">
            <el-icon :size="28"><Box /></el-icon>
          </div>
          <h1 class="brand-title">家庭物品管理</h1>
        </div>
        
        <nav class="main-nav">
          <router-link 
            to="/" 
            class="nav-item"
            :class="{ active: route.path === '/' }"
          >
            <el-icon><Grid /></el-icon>
            <span>物品列表</span>
          </router-link>
          <router-link 
            to="/new" 
            class="nav-item"
            :class="{ active: route.path === '/new' }"
          >
            <el-icon><Plus /></el-icon>
            <span>新增物品</span>
          </router-link>
          <router-link 
            to="/backup" 
            class="nav-item"
            :class="{ active: route.path === '/backup' }"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>数据管理</span>
          </router-link>
        </nav>
        
        <div class="header-actions">
          <el-button 
            type="primary" 
            class="add-btn"
            @click="$router.push('/new')"
          >
            <el-icon><Plus /></el-icon>
            新增物品
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="app-footer">
      <p>🏠 家庭物品管理系统 · 让生活更有序</p>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Box, Grid, Plus, DataAnalysis } from '@element-plus/icons-vue';

const route = useRoute();
</script>

<style>
/* 现代配色方案 - 渐变蓝紫主题 */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --bg-color: #f0f2f5;
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --border-radius: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.6;
}

.modern-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: 
    radial-gradient(ellipse at top, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    var(--bg-color);
}

/* Glass Header */
.glass-header {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: var(--primary-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.main-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.nav-item.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Header Actions */
.add-btn {
  background: var(--primary-gradient) !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  transition: all 0.3s ease !important;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 32px;
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: auto;
    flex-direction: column;
    padding-top: 16px;
    padding-bottom: 16px;
    gap: 16px;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .nav-item span {
    display: none;
  }

  .brand-title {
    font-size: 18px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
