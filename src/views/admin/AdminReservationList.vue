<template>
  <div class="admin-reservation-page">
    
    <!-- 顶部筛选区 -->
    <div class="filter-bar">
      <!-- 1. 学生ID筛选 (新增) -->
      <div class="filter-item">
        <span class="label">学生学号：</span>
        <input 
          type="text" 
          v-model.trim="queryParams.student_id" 
          placeholder="请输入学号"
          class="text-input"
        />
      </div>

      <!-- 2. 日期筛选 -->
      <div class="filter-item">
        <span class="label">预约日期：</span>
        <input 
          type="date" 
          v-model="queryParams.date" 
          class="date-input"
        />
      </div>

      <!-- 3. 状态筛选 -->
      <div class="filter-item">
        <span class="label">订单状态：</span>
        <select v-model="queryParams.status" class="status-select">
          <option value="">全部状态</option>
          <option value="active">待签到 (Active)</option>
          <option value="checked_in">使用中 (Checked In)</option>
          <option value="cancelled">已取消 (Cancelled)</option>
          <option value="no_show">未签到 (No Show)</option>
          <option value="released">已释放 (Released)</option>
        </select>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="handleReset" class="reset-btn">重置</button>
        <button @click="handleSearch" class="search-btn">查询</button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <span class="loader"></span> 数据加载中...
      </div>
      
      <!-- 数据列表 -->
      <div v-else-if="reservationList.length > 0" class="list-container">
        <div 
          v-for="(item, index) in reservationList" 
          :key="item.id || index" 
          class="record-card"
        >
          <!-- 左侧：核心信息 -->
          <div class="card-left">
            <div class="user-info">
              <span class="student-name">{{ item.student_name }}</span>
              <span class="student-id-tag">{{ item.student_id }}</span>
            </div>
            <div class="time-row">
              <span class="date">{{ item.date }}</span>
              <span class="time-range">{{ item.start_time }} - {{ item.end_time }}</span>
            </div>
          </div>

          <!-- 中间：位置信息 -->
          <div class="card-center">
            <div class="location-info">
              <span class="icon">📍</span>
              <span class="room-name">{{ item.room_id }}</span> 
              <span class="seat-code">{{ item.seat_id }}</span>
            </div>
            <!-- 如果有释放原因，显示在这里 -->
            <div v-if="item.reason" class="reason-text">
              备注: {{ item.reason }}
            </div>
          </div>

          <!-- 右侧：状态与操作 -->
          <div class="card-right">
            <div class="status-tag" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </div>
            <!-- 这里可以预留操作按钮，比如“强制释放” -->
            <!-- <button class="action-link">管理</button> -->
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无符合条件的预约记录</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getReservations } from '@/api/reservation';

// --- 状态定义 ---
const loading = ref(false);

// 默认获取今天的日期 YYYY-MM-DD
const getDefaultDate = () => new Date().toISOString().split('T')[0];

const queryParams = reactive({
  student_id: '', // 新增字段
  date: getDefaultDate(),
  status: ''
});

const reservationList = ref([]);

// --- 方法定义 ---

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 构造请求参数，过滤掉空值
    const params = {};
    if (queryParams.student_id) params.student_id = queryParams.student_id;
    if (queryParams.date) params.date = queryParams.date;
    if (queryParams.status) params.status = queryParams.status;

    const res = await getReservations(params);
    
    // 兼容不同的响应结构
    reservationList.value = res.data?.data || res.data || [];
  } catch (error) {
    console.error('获取预约列表失败:', error);
    ElMessage.error('获取数据失败，请稍后重试');
    reservationList.value = [];
  } finally {
    loading.value = false;
  }
};

// 查询按钮点击
const handleSearch = () => { 
  fetchData(); 
};

// 重置按钮点击
const handleReset = () => {
  queryParams.student_id = '';
  queryParams.date = getDefaultDate();
  queryParams.status = '';
  fetchData();
};

// 辅助函数：状态文本映射
const getStatusText = (status) => {
  const map = { 
    active: '待签到', 
    checked_in: '使用中', 
    cancelled: '已取消', 
    no_show: '未签到', 
    released: '已释放' 
  };
  return map[status] || status;
};

// 辅助函数：状态样式类名
const getStatusClass = (status) => { 
  return `status-${status}`; 
};

// 初始化加载
fetchData();

</script>

<style scoped>
.admin-reservation-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部筛选栏样式 */
.filter-bar {
  display: flex;
  gap: 15px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap; /* 允许在小屏幕换行 */
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 输入框通用样式 */
.text-input, .date-input, .status-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  color: #606266;
  transition: border-color 0.2s;
}

.text-input { width: 160px; } /* 学号输入框宽度 */
.date-input { width: 150px; }
.status-select { width: 180px; }

.text-input:focus, .date-input:focus, .status-select:focus {
  border-color: #409eff;
}

.action-buttons {
  margin-left: auto; /* 将按钮推到最右侧 */
  display: flex;
  gap: 10px;
}

.search-btn {
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-btn:hover { background-color: #66b1ff; }

.reset-btn {
  padding: 8px 20px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
}
.reset-btn:hover { color: #409eff; border-color: #c6e2ff; background-color: #ecf5ff; }

/* 列表容器 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 卡片样式 */
.record-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  border-left: 4px solid transparent; /* 预留左边框颜色 */
}

/* 根据状态给卡片加一点左边框颜色，增强视觉 */
.record-card:has(.status-active) { border-left-color: #1890ff; }
.record-card:has(.status-checked_in) { border-left-color: #52c41a; }

.card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.student-id-tag {
  font-size: 12px;
  background: #f4f4f5;
  color: #909399;
  padding: 2px 6px;
  border-radius: 4px;
}

.time-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.date { font-size: 16px; font-weight: 500; color: #606266; }
.time-range { font-size: 13px; color: #909399; }

.card-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 20px;
}

.location-info {
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.seat-code {
  background: #ecf5ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 5px;
}

.reason-text {
  font-size: 12px;
  color: #f56c6c; /* 红色显示备注/原因 */
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.status-checked_in { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-cancelled { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.status-no_show { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
.status-released { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }

/* 空状态与加载 */
.empty-state, .loading-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  background: #fff;
  border-radius: 8px;
}
.empty-icon { font-size: 48px; margin-bottom: 10px; }

/* 响应式调整 */
@media (max-width: 768px) {
  .record-card { flex-direction: column; align-items: flex-start; gap: 15px; }
  .card-right { align-items: flex-start; width: 100%; flex-direction: row; justify-content: space-between; }
  .action-buttons { margin-left: 0; width: 100%; justify-content: flex-end; }
}
</style>