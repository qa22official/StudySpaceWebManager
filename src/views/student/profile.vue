<template>
  <div class="profile-container">
    <!-- 顶部标题 -->
    <header class="page-header">
      <h1>个人中心</h1>
<<<<<<< HEAD
      <p class="subtitle">欢迎回来，{{ userInfo.name || '同学' }}</p>
    </header>

    <!-- 核心信息卡片 -->
    <el-card class="info-card" shadow="never" v-loading="loading">
=======
      <p class="subtitle">欢迎回来，{{ userInfo.name }}</p>
    </header>

    <!-- 核心信息卡片 -->
    <el-card class="info-card" shadow="never">
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>

      <!-- 垂直排列的信息列表 -->
      <div class="info-list">
        <div class="info-row">
          <span class="label">姓名</span>
          <span class="value">{{ userInfo.name }}</span>
        </div>
        
        <div class="info-row">
          <span class="label">学号 ID</span>
          <span class="value highlight-text">{{ userInfo.id }}</span>
        </div>

        <div class="info-row">
          <span class="label">所属学院</span>
          <span class="value">{{ userInfo.college }}</span>
        </div>

        <div class="info-row">
          <span class="label">专业</span>
          <span class="value">{{ userInfo.major }}</span>
        </div>

<<<<<<< HEAD
        <!-- 账号状态：根据 is_blacklisted 动态变化 -->
        <div class="info-row">
          <span class="label">账号状态</span>
          <el-tag 
            size="small" 
            effect="light" 
            :color="userInfo.is_blacklisted ? '#FEF2F2' : '#FFF7ED'" 
            :style="{ color: userInfo.is_blacklisted ? '#DC2626' : '#ea580c', borderColor: userInfo.is_blacklisted ? '#FECACA' : '#fed7aa' }"
          >
            {{ userInfo.is_blacklisted ? '黑名单' : '正常' }}
          </el-tag>
        </div>

        <!-- 如果是黑名单，显示原因和时间 -->
        <div class="info-row" v-if="userInfo.is_blacklisted">
          <span class="label">封禁原因</span>
          <span class="value error-text">{{ userInfo.blacklist_reason || '暂无说明' }}</span>
        </div>
        <div class="info-row" v-if="userInfo.is_blacklisted && userInfo.blacklist_until">
          <span class="label">预计解封</span>
          <span class="value">{{ formatTime(userInfo.blacklist_until) }}</span>
        </div>

=======
        <div class="info-row">
          <span class="label">账号状态</span>
          <el-tag size="small" effect="light" color="#FFF7ED" style="color: #ea580c; border-color: #fed7aa;">
            {{ userInfo.status === 'active' ? '正常' : userInfo.status }}
          </el-tag>
        </div>

>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
        <div class="info-row">
          <span class="label">违规次数</span>
          <span class="value">{{ userInfo.violation_count || 0 }} 次</span>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="action-area">
        <el-button type="primary" @click="dialogVisible = true">
          修改密码
        </el-button>
      </div>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改密码" width="400px">
      <el-form :model="form" label-position="top">
        <el-form-item label="旧密码">
          <el-input v-model="form.oldPass" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPass" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordChange" :loading="submitting">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
<<<<<<< HEAD
import { changeStudentPassword, getStudentProfile } from '@/api/auth' // 引入新接口

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)

// 用户信息响应式对象
=======
import { changeStudentPassword } from '@/api/auth'

// 从 localStorage 读取真实用户数据
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
const userInfo = reactive({
  id: '',
  name: '',
  college: '',
  major: '',
  status: 'active',
<<<<<<< HEAD
  violation_count: 0,
  is_blacklisted: false,
  blacklist_reason: '',
  blacklist_until: ''
})

// 格式化时间辅助函数
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').substring(0, 16)
}

// 页面加载时获取最新数据
onMounted(async () => {
  loading.value = true
  try {
    const res = await getStudentProfile()
    // 假设后端返回结构为 { code: 0, data: { ... } }
    const data = res.data?.data || res.data || {}
    
    // 将后端数据映射到前端对象
    Object.assign(userInfo, {
      id: data.id,
      name: data.name,
      college: data.college,
      major: data.major,
      status: data.status,
      violation_count: data.violation_count,
      is_blacklisted: data.is_blacklisted,
      blacklist_reason: data.blacklist_reason,
      blacklist_until: data.blacklist_until
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取个人信息失败，请重新登录')
  } finally {
    loading.value = false
  }
})

=======
  violation_count: 0
})

onMounted(() => {
  try {
    const stored = localStorage.getItem('user_info')
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.assign(userInfo, parsed)
    }
  } catch (e) {
    console.error('读取用户信息失败:', e)
  }
})

const dialogVisible = ref(false)
const submitting = ref(false)
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
const form = reactive({
  oldPass: '',
  newPass: ''
})

// 处理密码修改
const handlePasswordChange = async () => {
  if (!form.oldPass || !form.newPass) {
    ElMessage.warning('请填写完整密码信息')
    return
  }
  if (form.newPass.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }

  submitting.value = true
  try {
<<<<<<< HEAD
    // 调用 API 文档规定的接口
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
    await changeStudentPassword({
      old_password: form.oldPass,
      new_password: form.newPass
    })
    ElMessage.success('密码修改成功')
    dialogVisible.value = false
    form.oldPass = ''
    form.newPass = ''
  } catch (error) {
    const msg = error.response?.data?.message || '密码修改失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

/* 头部样式 */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 卡片样式 - 浅橙色主题 */
.info-card {
  border-radius: 12px;
<<<<<<< HEAD
  border: 1px solid #ffedd5;
=======
  border: 1px solid #ffedd5; /* 极浅的橙色边框 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  background-color: #fff;
}

.card-header span {
  font-weight: bold;
<<<<<<< HEAD
  color: #9a3412;
=======
  color: #9a3412; /* 深橙色文字 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  font-size: 16px;
}

/* 垂直列表布局 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.label {
  color: #64748b;
  font-size: 14px;
}

.value {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
}

.highlight-text {
<<<<<<< HEAD
  color: #ea580c;
=======
  color: #ea580c; /* 橙色高亮学号 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  font-family: monospace;
  font-size: 15px;
}

<<<<<<< HEAD
.error-text {
  color: #dc2626;
}

=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
/* 按钮区域 */
.action-area {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f8fafc;
}

.action-area .el-button {
  min-width: 120px;
<<<<<<< HEAD
=======
  /* 覆盖 Element Plus 默认蓝色，改为橙色系 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  --el-color-primary: #ea580c; 
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>