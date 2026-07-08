<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>黑名单管理</h2>
      <router-link to="/admin/students">
        <button class="btn-secondary">返回学生管理</button>
      </router-link>
    </div>

    <p class="desc">以下学生因违规被限制预约，解除后将重置其违约计数。</p>

    <!-- 修改：增加了 v-if 防止加载时的闪烁 -->
    <table class="data-table" v-if="blacklist.length > 0">
      <thead>
        <tr>
          <!-- 修正：根据 API 文档调整表头 -->
          <th>学号 (Student ID)</th>
          <th>违规原因</th>
          <th>违约次数</th>
          <th>解禁日期</th>
          <th>记录创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 修正：key 使用 item.id (黑名单记录ID) -->
        <tr v-for="item in blacklist" :key="item.id">
          <!-- 修正：显示 student_id 而不是 id -->
          <td>{{ item.student_id }}</td>
          
          <!-- 新增：显示 API 返回的 reason -->
          <td>{{ item.reason }}</td>
          
          <!-- 新增：显示 violation_count -->
          <td>{{ item.violation_count }}</td>
          
          <!-- 新增：显示 until_date -->
          <td>{{ item.until_date }}</td>
          
          <!-- 新增：显示 created_at -->
          <td>{{ item.created_at }}</td>
          
          <td>
            <!-- 修正：传入 item.student_id 给删除接口 -->
            <button @click="handleRemove(item.student_id)" class="btn-success">
              解除黑名单
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading" class="empty-state">
      暂无黑名单数据
    </div>
    
    <!-- 可选：增加 loading 状态提示 -->
    <div v-if="loading" class="empty-state">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getBlacklist, removeBlacklist } from '../../api/student';

const blacklist = ref([]);
const loading = ref(false); // 增加加载状态

// 获取黑名单
const fetchBlacklist = async () => {
  loading.value = true;
  try {
    const res = await getBlacklist();
    blacklist.value = res.data?.data || [];
  } catch (error) {
    console.error('获取黑名单失败:', error);
    ElMessage.error('获取黑名单列表失败');
  } finally {
    loading.value = false;
  }
};

// 解除黑名单
const handleRemove = async (studentId) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除学号为 ${studentId} 的学生黑名单状态吗？`,
      '确认解除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
  } catch { return; }

  try {
    await removeBlacklist(studentId);
    ElMessage.success('解除成功！该学生已恢复正常状态。');
    fetchBlacklist();
  } catch (error) {
    const msg = error.response?.data?.message || '解除失败，请稍后重试';
    ElMessage.error(msg);
  }
};

onMounted(() => {
  fetchBlacklist();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.desc { color: #666; margin-bottom: 20px; font-size: 0.9em; }

.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.data-table th, .data-table td { border: 1px solid #eee; padding: 12px; text-align: left; }
.data-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
.data-table tr:hover { background-color: #f5f5f5; }

.btn-success { 
  background-color: #28a745; 
  color: white; 
  border: none; 
  padding: 6px 12px; 
  border-radius: 4px; 
  cursor: pointer; 
  transition: background 0.3s;
}
.btn-success:hover { background-color: #218838; }

.btn-secondary { 
  background-color: #6c757d; 
  color: white; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 4px; 
  cursor: pointer; 
  text-decoration: none; 
  display: inline-block;
}
.btn-secondary:hover { background-color: #5a6268; }

.empty-state { text-align: center; padding: 50px; color: #999; border: 1px dashed #ddd; border-radius: 8px; margin-top: 20px; }
</style>