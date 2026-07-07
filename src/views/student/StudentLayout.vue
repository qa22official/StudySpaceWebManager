<template>
  <div class="layout-container">
    <div class="sidebar">
      <h3>学生中心</h3>
      <ul>
        <li><router-link to="/student/profile">个人中心</router-link></li>
        <li><router-link to="/student/my-seat">我的座位</router-link></li>
        <li><router-link to="/student/book">在线预约</router-link></li>
        <li><router-link to="/student/history">历史预约</router-link></li>
        <!-- 移除了内联样式，统一使用 class 控制 -->
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

/* 标题左侧内边距与列表项对齐 */
.sidebar h3 {
  padding-left: 8px;
  margin: 0 0 20px 0;
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

/* 所有导航链接左对齐实现 */
.sidebar a {
  display: block;
  color: #5D4037;
  text-decoration: none;
  padding: 12px 16px 12px 8px; /* 上右下左：左侧仅8px */
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

/* 退出登录项样式（与其他导航项完全一致） */
.logout-item {
  display: block; /* 关键：变为块级元素以支持 padding */
  color: #5D4037;
  cursor: pointer;
  padding: 12px 16px 12px 8px; /* 上右下左：左侧仅8px */
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