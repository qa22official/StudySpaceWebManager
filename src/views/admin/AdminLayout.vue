<template>
  <div class="layout-container">
    <div class="sidebar">
      <ul>
        <li><router-link to="/admin/students">学生管理</router-link></li>
        <li><router-link to="/admin/seats">座位管理</router-link></li>
        
        <!-- ✅ 新增：预约记录菜单项 -->
        <li><router-link to="/admin/reservations">预约记录</router-link></li>
        
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
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning'
    });
    localStorage.clear();
    router.push('/login');
  } catch { /* 用户取消 */ }
};
</script>

<style scoped>
/* ... 原有样式保持不变 ... */
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
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin-bottom: 14px;
  padding-left: 8px;
  padding-right: 16px;
}

.sidebar a {
  display: block;
  color: #5D4037;
  text-decoration: none;
  padding: 12px 16px 12px 8px;
  border-radius: 6px;
  transition: none;
  text-align: left;
}

.sidebar a.router-link-active {
  font-weight: 600;
  color: #3E2723;
  background: rgba(255, 255, 255, 0.5);
  border-left: 3px solid #5D4037;
  padding-left: 13px;
}

.logout-item {
  color: #5D4037;
  cursor: pointer;
  padding: 12px 16px 12px 8px;
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