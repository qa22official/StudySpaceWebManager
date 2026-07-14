<template>
  <div class="history-page">
    <!-- 顶部筛选区 -->
    <div class="filter-bar">
      <div class="filter-item">
        <span class="label">日期：</span>
        <!-- 关键点：value 必须绑定 YYYY-MM-DD 格式，否则原生日期控件可能显示异常 -->
        <input 
          type="date" 
          v-model="queryParams.date" 
          class="date-input"
        />
      </div>

      <div class="filter-item">
        <span class="label">状态：</span>
        <select v-model="queryParams.status" class="status-select">
          <option value="">全部</option>
          <option value="active">待签到 (Active)</option>
          <option value="checked_in">使用中 (Checked In)</option>
          <option value="completed">已完成 (Completed)</option>
          <option value="cancelled">已取消 (Cancelled)</option>
          <option value="no_show">未签到 (No Show)</option>
          <option value="released">已释放 (Released)</option>
        </select>
      </div>

      <button @click="handleSearch" class="search-btn">查询</button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      
      <!-- 情况 A：有数据时显示列表 -->
      <div v-if="loading" class="loading-state">加载中...</div>
      
      <div v-else-if="reservationList.length > 0" class="list-container">
        <div 
          v-for="(item, index) in reservationList" 
          :key="item.id || index" 
          class="record-card"
        >
          <!-- 左侧：时间与状态 -->
          <div class="card-left">
            <div class="time-row">
              <span class="date">{{ item.date }}</span>
              <span class="time-range">{{ item.start_time }} - {{ item.end_time }}</span>
            </div>
            <div class="status-tag" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </div>
          </div>

          <!-- 右侧：位置信息 -->
          <div class="card-right">
            <div class="location-info">
              <span class="icon">📍</span>
              <!-- 严格使用接口返回字段 -->
              <span class="room-name">{{ getRoomName(item.room_id) }}</span> 
              <span class="seat-code">{{ getSeatLabel(item) }}</span>
            </div>
            <div class="meta-info">
               预约人: {{ item.student_name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 情况 B：无数据时显示空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <p>当前筛选条件下暂无预约记录</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getReservations } from '@/api/reservation';
import { getAllRooms } from '@/api/dashboard';

const loading = ref(false);
const queryParams = reactive({
  date: new Date().toISOString().split('T')[0],
  status: ''
});
const reservationList = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (queryParams.date) params.date = queryParams.date;
    if (queryParams.status) params.status = queryParams.status;
    const res = await getReservations(params);
    reservationList.value = res.data?.data || res.data || [];
  } catch (error) {
    console.error('获取历史失败:', error);
    ElMessage.error('获取预约历史失败');
    reservationList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => { fetchData(); };

const roomMap = ref({});

const loadRoomNames = async () => {
  try {
    const res = await getAllRooms();
    const rooms = res.data?.data || res.data || [];
    const map = {};
    rooms.forEach((r) => { 
      map[r.id] = `${r.campus} ${r.building} ${r.name}`; 
    });
    roomMap.value = map;
  } catch (e) { console.error('加载自习室名称失败:', e); }
};

const getRoomName = (roomId) => roomMap.value[roomId] || roomId;
const getSeatLabel = (item) => {
  if (item.seat_code) return item.seat_code;
  const seatId = item.seat_id;
  if (!seatId) return '-';
  const parts = seatId.split('_seat_');
  return parts.length > 1 ? parts[1] : seatId;
};

const getStatusText = (status) => {
  const map = { active:'待签到', checked_in:'使用中', completed:'已完成', cancelled:'已取消', no_show:'未签到', released:'已释放' };
  return map[status] || status;
};

const getStatusClass = (status) => { return `status-${status}`; };

onMounted(() => { 
  loadRoomNames().then(() => fetchData()); 
});
</script>

<style scoped>
.history-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部筛选栏样式 */
.filter-bar {
  display: flex;
  gap: 15px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #606266;
}

/* 输入框样式优化 */
.date-input, .status-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  color: #606266;
}

.date-input:focus, .status-select:focus {
  border-color: #409eff;
}

.search-btn {
  margin-left: auto; /* 推到最右边 */
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background-color: #66b1ff;
}

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
  transition: transform 0.2s;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.1);
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.date {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.time-range {
  font-size: 14px;
  color: #909399;
}

.card-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.location-info {
  font-size: 16px;
  font-weight: 500;
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

.meta-info {
  font-size: 12px;
  color: #c0c4cc;
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
.status-completed { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-cancelled { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.status-no_show { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
.status-released { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; }

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  background: #fff;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>