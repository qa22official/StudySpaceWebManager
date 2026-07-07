<template>
  <div class="reports-page">
    <!-- 顶部标题与操作栏 -->
    <div class="page-header">
      <h2 class="page-title">自习室使用率统计报表</h2>
      <div class="header-actions">
        <span class="subtitle">监控各区域资源占用情况</span>
      </div>
    </div>

    <!-- 筛选控制区 (卡片风格) -->
    <div class="filter-card">
      <div class="date-group">
        <label class="input-label">统计周期：</label>
        <div class="date-inputs">
          <input type="date" v-model="query.start_date" class="form-input" />
          <span class="separator">至</span>
          <input type="date" v-model="query.end_date" class="form-input" />
        </div>
      </div>
      
      <button @click="handleSearch" :disabled="loading" class="btn-primary">
        <span v-if="!loading">查询数据</span>
        <span v-else class="loading-spinner"></span>
      </button>
    </div>

    <!-- 数据展示区 -->
    <div class="table-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="status-box loading-state">
        <div class="spinner"></div>
        <p>正在分析数据...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="reports.length === 0" class="status-box empty-state">
        <div class="empty-icon">📊</div>
        <p>暂无数据，请尝试调整日期范围</p>
      </div>

      <!-- 表格 -->
      <table v-else class="data-table">
        <thead>
          <tr>
            <th style="width: 30%">自习室名称</th>
            <th style="width: 15%">预约次数</th>
            <th style="width: 20%">总使用时长 (小时)</th>
            <th style="width: 35%">平均使用率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reports" :key="item.room_id || index">
            <td>
              <div class="room-info">
                <span class="room-name">{{ item.room_name }}</span>
                <span class="room-id">{{ item.room_id }}</span>
              </div>
            </td>
            <td class="text-center font-bold">{{ item.reservation_count }}</td>
            <td class="text-center text-highlight">{{ item.used_hours }} h</td>
            <td>
              <!-- 可视化进度条 -->
              <div class="progress-wrapper">
                <div class="progress-bg">
                  <div 
                    class="progress-fill" 
                    :class="getRateClass(item.average_usage_rate)"
                    :style="{ width: Math.min(item.average_usage_rate * 100, 100) + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ (item.average_usage_rate * 100).toFixed(1) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUsageReport } from '@/api/reports'; // 确保路径正确

// 初始化日期：默认最近7天
const initDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { start_date: fmt(start), end_date: fmt(end) };
};

const query = ref(initDate());
const reports = ref([]);
const loading = ref(false);

// 获取颜色类名，让报表更直观
const getRateClass = (rate) => {
  if (rate >= 0.8) return 'bg-red';   // 爆满
  if (rate >= 0.5) return 'bg-blue';  // 正常
  return 'bg-green';                  // 空闲
};

const handleSearch = async () => {
  if (!query.value.start_date || !query.value.end_date) {
    alert("请选择完整的日期范围");
    return;
  }

  loading.value = true;
  try {
    const res = await getUsageReport(query.value);
    // 兼容处理：拦截器可能解包了 data，也可能没解包
    reports.value = res.data?.data || res.data || [];
  } catch (error) {
    console.error("报表获取失败:", error);
    alert("数据加载失败，请稍后重试");
    reports.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
/* 页面整体布局 */
.reports-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #303133;
}

.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2f3d;
}
.subtitle {
  font-size: 14px;
  color: #909399;
}

/* 筛选卡片 */
.filter-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.date-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-label {
  font-weight: 500;
  color: #606266;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: #409eff;
}

.separator {
  color: #909399;
}

.btn-primary {
  background-color: #409eff;
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}
.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}
.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 表格容器 */
.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 600;
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #f5f7fa;
}

/* 内容样式细节 */
.room-info {
  display: flex;
  flex-direction: column;
}
.room-name {
  font-weight: 500;
  color: #303133;
}
.room-id {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.text-center { text-align: center; }
.font-bold { font-weight: bold; color: #303133; }
.text-highlight { color: #409eff; font-weight: 500; }

/* 进度条组件 */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-bg {
  flex: 1;
  height: 8px;
  background-color: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.bg-green { background-color: #67c23a; } /* 空闲 */
.bg-blue { background-color: #409eff; }  /* 适中 */
.bg-red { background-color: #f56c6c; }  /* 拥挤 */

.progress-text {
  font-size: 12px;
  color: #606266;
  width: 45px;
  text-align: right;
}

/* 状态提示框 */
.status-box {
  padding: 60px 0;
  text-align: center;
  color: #909399;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>