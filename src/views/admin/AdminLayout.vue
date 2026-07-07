<template>
  <div class="layout-container">
    <div class="sidebar">
      <ul>
        <li><router-link to="/admin/students">学生管理</router-link></li>
        <li><router-link to="/admin/seats">座位管理</router-link></li>
        <li><router-link to="/admin/dashboard">看板热力图</router-link></li>
        <li><router-link to="/admin/reports">统计报表</router-link></li>
        <li><router-link to="/admin/profile">个人中心</router-link></li>
        <li @click="logout" class="logout-item">退出登录</li>
      </ul>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const logout = () => { 
  localStorage.clear(); 
  router.push('/login'); 
};
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: #FFE0B2;
  padding: 24px 0;
  font-size: 16px;
}

.sidebar ul {
  list-style: none;
  padding: 0; /* 移除左侧默认内边距 */
  margin: 0;
}

.sidebar li {
  margin-bottom: 14px;
  padding-left: 8px; /* 关键：左侧仅保留8px呼吸空间 */
  padding-right: 16px;
}

/* 所有链接左对齐实现 */
.sidebar a {
  display: block;
  color: #5D4037;
  text-decoration: none;
  padding: 12px 16px 12px 8px; /* 上右下左：左侧仅8px */
  border-radius: 6px;
  transition: none;
  text-align: left; /* 显式声明左对齐 */
}

.sidebar a.router-link-active {
  font-weight: 600;
  color: #3E2723;
  /* 移除左侧标识符，严格保持左对齐 */
}

.logout-item {
  color: #5D4037;
  cursor: pointer;
  padding: 12px 16px 12px 8px; /* 与链接保持一致 */
  border-radius: 6px;
  text-align: left;
}

.logout-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #FFFFFF;
}
</style>