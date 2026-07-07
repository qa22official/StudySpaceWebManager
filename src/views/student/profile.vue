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
          <el-button type="primary" @click="handlePasswordChange">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 模拟数据（实际逻辑中这里会从 localStorage 或 Pinia 获取）
const userInfo = reactive({
  id: '20260001',
  name: '张三',
  college: '信息学院',
  major: '软件工程',
  status: 'active',
  violation_count: 0
})

const dialogVisible = ref(false)
const form = reactive({
  oldPass: '',
  newPass: ''
})

// 处理密码修改逻辑
const handlePasswordChange = () => {
  if (!form.oldPass || !form.newPass) {
    // 简单的校验提示
    return alert('请填写完整密码信息')
  }
  console.log('提交修改密码:', form)
  // TODO: 调用后端 API 修改密码
  dialogVisible.value = false
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