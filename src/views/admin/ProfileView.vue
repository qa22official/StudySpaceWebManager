<template>
  <div class="profile-container">
    <!-- 顶部欢迎语 -->
    <header class="page-header">
      <h1>管理员中心</h1>
      <p class="subtitle">欢迎回来，{{ userInfo.name }}。这里是您的个人设置与账号概览。</p>
    </header>

    <div class="content-grid">
      <!-- 左侧：身份卡片 -->
      <div class="card identity-card">
        <div class="avatar-placeholder">
          {{ avatarText }}
        </div>
        <h2 class="user-name">{{ userInfo.name }}</h2>
        <span class="role-badge">系统管理员</span>
        
        <div class="info-list">
          <div class="info-item">
            <span class="label">管理员 ID</span>
            <span class="value mono-font">{{ userInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ formatDate(userInfo.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：安全与状态 -->
      <div class="card status-card">
        <h3 class="section-title">账号状态</h3>
        <div class="status-row">
          <div class="status-icon success">✓</div>
          <div class="status-text">
            <strong>认证状态</strong>
            <p>当前会话有效，Token 正常</p>
          </div>
        </div>
        
        <div class="divider"></div>

        <h3 class="section-title">安全提示</h3>
        <ul class="tips-list">
          <li>请妥善保管您的管理员账号，不要泄露给他人。</li>
          <li>建议在公共电脑上使用后及时退出登录。</li>
        </ul>
        
        <button class="logout-btn" @click="handleLogout">退出当前账号</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();

// 初始化用户信息对象，防止渲染报错
const userInfo = ref({
  id: '-',
  name: '加载中...',
  created_at: ''
});

// 计算属性：生成头像文字（取名字第一个字）
const avatarText = computed(() => {
  return userInfo.value.name ? userInfo.value.name.charAt(0) : '管';
});

// 格式化时间工具函数
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.split('T')[0]; // 简单截取日期部分
};

onMounted(() => {
  try {
    const storedInfo = localStorage.getItem('user_info');
    if (storedInfo) {
      // 解析并赋值
      userInfo.value = JSON.parse(storedInfo);
    }
  } catch (e) {
    console.error('解析用户信息失败', e);
  }
});

// 退出登录逻辑
const handleLogout = async () => {
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
/* 容器布局 */
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

/* 网格布局 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列等宽 */
  gap: 24px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr; /* 移动端单列 */
  }
}

/* 卡片通用样式 */
.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 左侧身份卡片特有样式 */
.identity-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.user-name {
  font-size: 20px;
  margin: 0 0 8px 0;
}

.role-badge {
  background: #e6f7ff;
  color: #007bff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 24px;
}

.info-list {
  width: 100%;
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item .label {
  color: #888;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.mono-font {
  font-family: monospace; /* ID 用等宽字体更好看 */
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 右侧状态卡片特有样式 */
.section-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
  border-left: 4px solid #007bff;
  padding-left: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: bold;
}

.status-icon.success {
  background: #d9f7be;
  color: #52c41a;
}

.status-text strong {
  display: block;
  font-size: 14px;
  color: #333;
}

.status-text p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
}

.tips-list {
  padding-left: 20px;
  margin: 0 0 24px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: white;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.logout-btn:hover {
  background: #ff4d4f;
  color: white;
}
</style>