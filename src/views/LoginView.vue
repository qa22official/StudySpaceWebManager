<template>
  <div class="login-container">
    <!-- 背景层 -->
    <div class="bg-layer"></div>
    
    <div class="login-box">
      <h2 class="title">智能校园自习室</h2>
      
      <!-- 身份切换 Tabs -->
      <div class="role-tabs">
        <div 
          class="tab-item" 
          :class="{ active: role === 'student' }" 
          @click="switchRole('student')"
        >
          我是学生
        </div>
        <div 
          class="tab-item" 
          :class="{ active: role === 'admin' }" 
          @click="switchRole('admin')"
        >
          我是管理员
        </div>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>{{ role === 'student' ? '学号' : '管理员账号' }}</label>
          <input 
            v-model="form.id" 
            :placeholder="role === 'student' ? '请输入学号 (如 20260001)' : '请输入 admin'" 
            required 
          />
        </div>
        
        <div class="input-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码" 
            required 
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
// 引入刚才写好的 API 接口
import { studentLogin, adminLogin } from '../api/auth.js'; 

const router = useRouter();

// 状态定义
const role = ref('student'); // 默认是学生
const loading = ref(false);
const error = ref('');
const form = reactive({
  id: '',
  password: ''
});

// 切换身份时清空报错和表单（可选）
const switchRole = (newRole) => {
  role.value = newRole;
  error.value = '';
  form.id = '';
  form.password = '';
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    let res;
    // 根据选择的角色调用不同的接口
    if (role.value === 'admin') {
      // 构造管理员需要的数据格式 { admin_id, password }
      res = await adminLogin({ 
        admin_id: form.id, 
        password: form.password 
      });
    } else {
      // 构造学生需要的数据格式 { student_id, password }
      res = await studentLogin({ 
        student_id: form.id, 
        password: form.password 
      });
    }
    
    // 假设后端返回结构为 { code: 200, data: { access_token, role, user... } }
    const responseData = res.data.data || res.data; 

    // 保存 Token 和 信息
    localStorage.setItem('access_token', responseData.access_token);
    localStorage.setItem('role', responseData.role || role.value); // 优先用后端的，没有就用本地的
    localStorage.setItem('user_info', JSON.stringify(responseData.user || {}));

    // 路由跳转
    if (responseData.role === 'admin' || role.value === 'admin') {
      router.push('/admin/students');
    } else {
      router.push('/student/profile');
    }

  } catch (err) {
    console.error(err);
    // 简单的错误处理
    const msg = err.response?.data?.message || '登录失败，请检查账号密码';
    error.value = msg;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 容器全屏 */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 背景图层：这里引用你的图片 */
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 替换成你的图片路径 */
  background-image: url('../assets/login-bg.jpg'); 
  background-size: cover;
  background-position: center;
  z-index: -1;
}



/* 登录卡片：毛玻璃效果 */
.login-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px); /* 关键：背景模糊 */
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 360px;
  text-align: center;
}

.title {
  margin-bottom: 25px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

/* 身份切换 Tabs */
.role-tabs {
  display: flex;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 25px;
}

.tab-item {
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #666;
}

.tab-item.active {
  background: white;
  color: #007bff;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
  background: rgba(255, 255, 255, 0.8);
}

.input-group input:focus {
  border-color: #007bff;
  background: #fff;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background: #0056b3;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-msg {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 15px;
}
</style>