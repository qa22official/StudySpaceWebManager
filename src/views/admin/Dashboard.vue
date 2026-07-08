<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">实时自习室看板</h2>
        <p class="page-subtitle">监控座位占用情况与实时热度分布</p>
      </div>
<<<<<<< HEAD
=======
      
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
      <!-- 筛选控制区 -->
      <div class="filters">
        <div class="filter-group">
          <label>选择区域：</label>
          <select v-model="selectedRoomId" @change="handleRoomChange" class="form-select">
            <option value="" disabled>请选择自习室</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>
<<<<<<< HEAD
=======

>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
        <div class="filter-group">
          <label>查看日期：</label>
          <input type="date" v-model="selectedDate" class="form-input" @change="fetchHeatmap" />
        </div>
<<<<<<< HEAD
        <!-- 新增：时间选择（可选，若不需要可隐藏，默认传当前时间） -->
        <!-- <div class="filter-group">
          <label>查看时间：</label>
          <input type="time" v-model="selectedTime" class="form-input" @change="fetchHeatmap" />
        </div> -->
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">🪑</div>
        <div class="stat-info">
          <span class="label">总座位数</span>
          <span class="value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon occupied">🔥</div>
        <div class="stat-info">
          <span class="label">当前占用</span>
          <span class="value text-red">{{ stats.occupied }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon available">✅</div>
        <div class="stat-info">
          <span class="label">剩余可用</span>
          <span class="value text-green">{{ stats.available }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate">📊</div>
        <div class="stat-info">
          <span class="label">实时占用率</span>
          <span class="value">{{ stats.rate }}%</span>
        </div>
      </div>
    </div>

<<<<<<< HEAD
    <!-- 座位分布热力图 -->
=======
    <!-- 座位分布热力图 (分行显示版) -->
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
    <div class="heatmap-panel">
      <div class="panel-header">
        <h3>座位分布热力图</h3>
        <div class="legend">
          <span class="legend-item"><i class="dot free"></i>空闲</span>
          <span class="legend-item"><i class="dot taken"></i>已占用</span>
          <span class="legend-item"><i class="dot maintenance"></i>维护中</span>
        </div>
      </div>

      <!-- 加载遮罩 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>数据加载中...</span>
      </div>

<<<<<<< HEAD
      <!-- 核心：按行分组渲染 -->
=======
      <!-- 核心修改：按行分组渲染 -->
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
      <div class="seat-map-container">
        <div v-for="(rowSeats, rowIndex) in groupedSeats" :key="rowIndex" class="seat-row">
          <!-- 行号标识 -->
          <div class="row-label">第 {{ rowSeats[0]?.row || rowIndex + 1 }} 排</div>
<<<<<<< HEAD
          <!-- 该行座位 -->
          <div class="seats-wrapper">
            <div
              v-for="seat in rowSeats"
              :key="seat.seat_id"
              class="seat-box"
              :class="getSeatClass(seat.status)"
              :title="`${seat.code} - ${getStatusText(seat.status)}`"
            >
              {{ seat.code }}
            </div>
          </div>
        </div>
=======
          
          <!-- 该行座位 -->
          <div class="seats-wrapper">
            <div 
              v-for="seat in rowSeats" 
              :key="seat.id"
              class="seat-box"
              :class="getSeatClass(seat.status)"
              :title="`${seat.seatNo} - ${getStatusText(seat.status)}`"
            >
              {{ seat.seatNo }}
            </div>
          </div>
        </div>
        
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
        <!-- 空状态提示 -->
        <div v-if="!loading && groupedSeats.length === 0" class="empty-state">
          暂无座位数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
<<<<<<< HEAD
import { getAllRooms, getRoomHeatmap } from '@/api/dashboard';
import dayjs from 'dayjs';
=======
import { getAllRooms, getRoomHeatmap } from '@/api/dashboard'; 
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55

// --- 状态定义 ---
const rooms = ref([]);
const selectedRoomId = ref('');
<<<<<<< HEAD
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
// const selectedTime = ref(dayjs().format('HH:mm')); // 如果需要手动选时间，取消注释
=======
const selectedDate = ref(new Date().toISOString().split('T')[0]);
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
const seats = ref([]);
const loading = ref(false);

// 统计数据
const stats = reactive({
  total: 0,
  occupied: 0,
  available: 0,
  rate: '0.0'
});

// --- 核心逻辑：按行分组座位 ---
const groupedSeats = computed(() => {
  if (!seats.value.length) return [];
<<<<<<< HEAD
  // 1. 获取所有唯一的行号并排序
  const rowNumbers = [...new Set(seats.value.map(s => s.row))].sort((a, b) => a - b);
=======
  
  // 1. 获取所有唯一的行号并排序
  const rowNumbers = [...new Set(seats.value.map(s => s.row))].sort((a, b) => a - b);
  
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  // 2. 按行号归类
  return rowNumbers.map(rowNum => {
    return seats.value
      .filter(s => s.row === rowNum)
      .sort((a, b) => a.col - b.col); // 同一行内按列号排序
  });
});

<<<<<<< HEAD
// --- 辅助函数：状态值映射 ---
const getSeatClass = (status) => {
  // API 返回: available, occupied, maintenance
=======
// --- 辅助函数：状态值映射 (API 返回字符串状态) ---
const getSeatClass = (status) => {
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  if (status === 'occupied') return 'is-taken';
  if (status === 'maintenance') return 'is-maintenance';
  return 'is-free';
};

const getStatusText = (status) => {
<<<<<<< HEAD
  const map = {
    available: '空闲',
    occupied: '已占用',
    maintenance: '维护中'
  };
=======
  const map = { available: '空闲', occupied: '已占用', maintenance: '维护中' };
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  return map[status] || '未知';
};

// --- 数据获取 ---
const fetchRooms = async () => {
  try {
    const res = await getAllRooms();
<<<<<<< HEAD
    // 兼容处理返回结构
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
    const list = res.data?.data || res.data || [];
    rooms.value = list;
    if (rooms.value.length) {
      selectedRoomId.value = rooms.value[0].id;
    }
  } catch (e) {
    console.error('获取自习室列表失败:', e);
    ElMessage.error('获取自习室列表失败');
  }
};

const fetchHeatmap = async () => {
  if (!selectedRoomId.value) return;
  loading.value = true;
  try {
<<<<<<< HEAD
    // 修正：传入 time 参数，如果不需要精确到分，可以传 '00:00' 或当前时间
    const currentTime = dayjs().format('HH:mm'); 
    const res = await getRoomHeatmap(selectedRoomId.value, selectedDate.value, currentTime);
    
    const payload = res.data?.data || res.data || {};
    
    // 更新统计
    stats.total = payload.total_seats || 0;
    stats.occupied = payload.occupied_seats || 0;
    stats.available = payload.available_seats || 0;
    stats.rate = stats.total ? ((stats.occupied / stats.total) * 100).toFixed(1) : '0.0';

    // 更新座位数据 (关键修正：字段名映射)
    const heatmap = payload.heatmap || [];
    seats.value = heatmap.map((s) => ({
      seat_id: s.seat_id, // 修正字段名
      code: s.code,       // 修正字段名
=======
    const res = await getRoomHeatmap(selectedRoomId.value, selectedDate.value);
    const payload = res.data?.data || res.data || {};
    stats.total = payload.total_seats || 0;
    stats.occupied = payload.occupied_seats || 0;
    stats.available = payload.available_seats || 0;
    stats.rate = stats.total
      ? ((stats.occupied / stats.total) * 100).toFixed(1)
      : '0.0';

    const heatmap = payload.heatmap || [];
    seats.value = heatmap.map((s) => ({
      id: s.seat_id,
      seatNo: s.code,
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
      row: s.row,
      col: s.col,
      status: s.status
    }));
  } catch (e) {
    console.error('获取热力图失败:', e);
    ElMessage.error('获取热力图数据失败');
    seats.value = [];
  } finally {
    loading.value = false;
  }
};

const handleRoomChange = () => fetchHeatmap();

<<<<<<< HEAD
// 监听日期变化
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
watch(selectedDate, () => fetchHeatmap());

onMounted(() => {
  fetchRooms().then(() => fetchHeatmap());
});
<<<<<<< HEAD

// 假设你已经有了 roomId, selectedDate, selectedTime
// 例如：selectedTime = "14:00"

const fetchData = async () => {
  try {
    const res = await getRoomHeatmap(
      currentRoomId.value, 
      currentDate.value, 
      currentTime.value // 传入第三个参数
    );
    // 处理 res.data...
  } catch (error) {
    console.error(error);
  }
};

=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
</script>

<style scoped>
/* ================= 全局容器 ================= */
.dashboard-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* ================= 头部与筛选 ================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.header-left h2 { margin: 0 0 6px 0; font-size: 20px; color: #303133; }
.header-left p { margin: 0; font-size: 13px; color: #909399; }

.filters { display: flex; gap: 20px; align-items: center; }
.filter-group { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #606266; }
<<<<<<< HEAD

=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.form-select, .form-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  color: #606266;
}
.form-select:focus, .form-input:focus { border-color: #409eff; }

/* ================= 统计卡片 ================= */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); }

.stat-icon {
<<<<<<< HEAD
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
=======
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  font-size: 24px;
}
.stat-icon.total { background: #ecf5ff; color: #409eff; }
.stat-icon.occupied { background: #fef0f0; color: #f56c6c; }
.stat-icon.available { background: #f0f9eb; color: #67c23a; }
.stat-icon.rate { background: #fdf6ec; color: #e6a23c; }

.stat-info { display: flex; flex-direction: column; }
.stat-info .label { font-size: 13px; color: #909399; margin-bottom: 4px; }
.stat-info .value { font-size: 24px; font-weight: bold; color: #303133; }
<<<<<<< HEAD

.text-red { color: #f56c6c !important; }
.text-green { color: #67c23a !important; }

/* ================= 热力图面板 ================= */
=======
.text-red { color: #f56c6c !important; }
.text-green { color: #67c23a !important; }

/* ================= 热力图面板 (分行布局核心) ================= */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.heatmap-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  position: relative;
  min-height: 400px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}
.panel-header h3 { margin: 0; font-size: 16px; color: #303133; }

.legend { display: flex; gap: 16px; font-size: 12px; color: #606266; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.free { background: #67c23a; }
.dot.taken { background: #f56c6c; }
.dot.maintenance { background: #909399; }

/* 座位地图容器 */
.seat-map-container {
  display: flex;
<<<<<<< HEAD
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
}

=======
  flex-direction: column; /* 垂直排列每一行 */
  gap: 20px; /* 行与行之间的间距 */
  align-items: center; /* 行居中显示 */
  padding: 20px 0;
}

/* 单行容器 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.seat-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

<<<<<<< HEAD
=======
/* 行号标签 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.row-label {
  width: 60px;
  text-align: right;
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

<<<<<<< HEAD
.seats-wrapper {
  display: flex;
  gap: 10px;
}

=======
/* 座位包裹器 */
.seats-wrapper {
  display: flex;
  gap: 10px; /* 座位左右间距 */
}

/* 单个座位块 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
.seat-box {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

/* 状态样式 */
.seat-box.is-free {
  background: #f0f9eb;
  color: #67c23a;
  border-color: #e1f3d8;
}
.seat-box.is-free:hover {
  background: #67c23a;
  color: #fff;
  transform: scale(1.1);
}

.seat-box.is-taken {
  background: #fef0f0;
  color: #f56c6c;
  border-color: #fde2e2;
  cursor: not-allowed;
}

.seat-box.is-maintenance {
  background: #f4f4f5;
  color: #909399;
  border-color: #e9e9eb;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* 加载与空状态 */
.loading-overlay {
<<<<<<< HEAD
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px 0;
=======
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 10; border-radius: 8px;
}
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #f3f3f3; border-top: 3px solid #409eff;
  border-radius: 50%; animation: spin 1s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-state {
  text-align: center; color: #909399; padding: 40px 0;
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
}
</style>