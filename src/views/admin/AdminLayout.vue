<template>
  <div class="layout-container">
    <div class="sidebar">
      <ul>
        <li><router-link to="/admin/students">学生管理</router-link></li>
        <li><router-link to="/admin/seats">座位管理</router-link></li>
<<<<<<< HEAD
        
        <!-- ✅ 新增：预约记录菜单项 -->
        <li><router-link to="/admin/reservations">预约记录</router-link></li>
        
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
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
<<<<<<< HEAD
/* ... 原有样式保持不变 ... */
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
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
<<<<<<< HEAD
  padding: 0;
=======
  padding: 0; /* 移除左侧默认内边距 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  margin: 0;
}

.sidebar li {
  margin-bottom: 14px;
<<<<<<< HEAD
  padding-left: 8px;
  padding-right: 16px;
}

=======
  padding-left: 8px; /* 关键：左侧仅保留8px呼吸空间 */
  padding-right: 16px;
}

/* 所有链接左对齐实现 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.sidebar a {
  display: block;
  color: #5D4037;
  text-decoration: none;
<<<<<<< HEAD
  padding: 12px 16px 12px 8px;
  border-radius: 6px;
  transition: none;
  text-align: left;
=======
  padding: 12px 16px 12px 8px; /* 上右下左：左侧仅8px */
  border-radius: 6px;
  transition: none;
  text-align: left; /* 显式声明左对齐 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
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
<<<<<<< HEAD
  padding: 12px 16px 12px 8px;
=======
  padding: 12px 16px 12px 8px; /* 与链接保持一致 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
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