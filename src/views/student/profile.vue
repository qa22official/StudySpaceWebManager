<template>
  <div class="profile-container">
    <!-- 顶部标题 -->
    <header class="page-header">
      <h1>个人中心</h1>
      <p class="subtitle">欢迎回来，{{ userInfo.name }}</p>
    </header>

    <!-- 核心信息卡片 -->
    <el-card class="info-card" shadow="never">
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

        <div class="info-row">
          <span class="label">账号状态</span>
          <el-tag size="small" effect="light" color="#FFF7ED" style="color: #ea580c; border-color: #fed7aa;">
            {{ userInfo.status === 'active' ? '正常' : userInfo.status }}
          </el-tag>
        </div>

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
import { changeStudentPassword } from '@/api/auth'

// 从 localStorage 读取真实用户数据
const userInfo = reactive({
  id: '',
  name: '',
  college: '',
  major: '',
  status: 'active',
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
  border: 1px solid #ffedd5; /* 极浅的橙色边框 */
  background-color: #fff;
}

.card-header span {
  font-weight: bold;
  color: #9a3412; /* 深橙色文字 */
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
  color: #ea580c; /* 橙色高亮学号 */
  font-family: monospace;
  font-size: 15px;
}

/* 按钮区域 */
.action-area {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f8fafc;
}

.action-area .el-button {
  min-width: 120px;
  /* 覆盖 Element Plus 默认蓝色，改为橙色系 */
  --el-color-primary: #ea580c; 
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>