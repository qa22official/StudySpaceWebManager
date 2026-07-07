<template>
  <div class="booking-container">
    <!-- 1. 顶部筛选栏 -->
    <div class="filter-panel">
      <div class="filter-group">
        <label>校区：</label>
        <select v-model="selectedCampus" @change="handleCampusChange">
          <option value="">请选择校区</option>
          <option v-for="c in campuses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>楼栋：</label>
        <select v-model="selectedBuilding" @change="handleBuildingChange" :disabled="!selectedCampus">
          <option value="">请选择楼栋</option>
          <option v-for="b in filteredBuildings" :key="b.id" :value="b.id">
            {{ b.name }} ({{ b.max_floor }}层)
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>自习室：</label>
        <select v-model="selectedRoom" @change="fetchSeats" :disabled="!selectedBuilding">
          <option value="">请选择房间</option>
          <option v-for="r in filteredRooms" :key="r.id" :value="r.id">
            {{ r.name }} ({{ r.floor }}层{{ r.zone ? ' ' + r.zone + '区' : '' }})
            <span v-if="r.is_quiet"> - 安静区</span>
          </option>
        </select>
      </div>
    </div>

    <!-- 2. 时间与操作栏 -->
    <div class="action-bar" v-if="selectedRoom">
      <div class="time-picker">
        <input type="date" v-model="query.date" :min="today" @change="fetchSeats" />
        <span> ~ </span>
        <select v-model="query.start_time" @change="onStartTimeChange">
          <option v-for="t in allTimeSlots" :key="t" :value="t">{{ t }}</option>
        </select>
        <span> 至 </span>
        <select v-model="query.end_time" @change="fetchSeats">
          <option v-for="t in filteredEndTimes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      
      <div class="legend">
        <span class="tag available">可选</span>
        <span class="tag occupied">已占</span>
        <span class="tag maintenance">维护</span>
        <span class="tag selected">选中</span>
      </div>
    </div>

    <!-- 3. 座位图渲染区域 -->
    <div class="seat-map-wrapper" v-if="seats.length > 0">
      <div class="room-info">
        <h3>当前房间：{{ currentRoomName }} <span v-if="currentRoomIsQuiet" style="color:#409eff; font-weight:600;">(安静区)</span></h3>
        <p>共 {{ seats.length }} 个座位 | 可用 {{ availableCount }} 个</p>
      </div>

      <!-- 核心：使用 CSS Grid 布局 -->
      <div 
        class="seat-grid" 
        :style="gridStyle"
      >
        <div 
          v-for="seat in seats" 
          :key="seat.id"
          class="seat-card"
          :class="[
            seat.booking_status, 
            { 'is-selected': selectedSeatId === seat.id },
            { 'has-socket': seat.power_socket }
          ]"
          :style="{
            gridColumn: seat.col,
            gridRow: seat.row
          }"
          @click="handleSeatClick(seat)"
        >
          <div class="seat-code">{{ seat.code }}</div>
          <!-- 插座图标：仅当 power_socket 为 true 时显示 -->
          <div v-if="seat.power_socket" class="socket-indicator" title="含电源插座">⚡</div>
        </div>
      </div>
    </div>

    <!-- 4. 底部确认栏 -->
    <div class="bottom-confirm" v-if="selectedSeatId">
      <div class="info">
        已选座位：<strong>{{ currentRoomName }} - {{ selectedSeatCode }}</strong>
      </div>
      <button class="btn-confirm" @click="submitReservation">确认预约</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as seatApi from '../../api/seat';
import { getBlacklist } from '../../api/student';
import { ElMessage } from 'element-plus'; // 假设使用了 Element Plus，如果没有可换成 alert

// --- 数据状态 ---
const campuses = ref([]);
const buildings = ref([]);
const rooms = ref([]);

const selectedCampus = ref('');
const selectedBuilding = ref('');
const selectedRoom = ref('');

const seats = ref([]);
const selectedSeatId = ref(null);
const isBlacklisted = ref(false);

// 当天日期，禁止选择过去
const today = new Date().toISOString().split('T')[0];

// 所有可选时间段
const allTimeSlots = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

// 结束时间必须晚于开始时间
const filteredEndTimes = computed(() =>
  allTimeSlots.filter(t => t > query.value.start_time)
);

// 查询参数
const query = ref({
  date: today,
  start_time: '08:00',
  end_time: '10:00'
});

// --- 计算属性 ---
const filteredBuildings = computed(() => 
  buildings.value.filter(b => b.campus_id === selectedCampus.value)
);

const filteredRooms = computed(() => 
  rooms.value.filter(r => r.building_id === selectedBuilding.value)
);

const currentRoomName = computed(() => {
  const r = rooms.value.find(item => item.id === selectedRoom.value);
  return r ? r.name : '';
});

const currentRoomIsQuiet = computed(() => {
  const r = rooms.value.find(item => item.id === selectedRoom.value);
  return r ? !!r.is_quiet : false;
});

const selectedSeatCode = computed(() => {
  const s = seats.value.find(item => item.id === selectedSeatId.value);
  return s ? s.code : '';
});

const availableCount = computed(() => 
  seats.value.filter(s => s.booking_status === 'available').length
);

// 动态计算 Grid 样式 (固定6列)
const gridStyle = computed(() => {
  // 规则：固定列宽 6 列
  return {
    gridTemplateColumns: 'repeat(6, 60px)',
    gap: '10px',
    justifyContent: 'center' // 居中显示
  };
});

// --- 方法 ---

// 1. 初始化基础数据
const loadBaseData = async () => {
  try {
    const res = await seatApi.getBaseData();
    if (res && res.code === 0) {
      // 使用后端返回的校区/楼栋/房间数据，不在前端去重
      campuses.value = res.data.campuses;
      buildings.value = res.data.buildings;
      rooms.value = res.data.rooms;
      console.log('loadBaseData:', campuses.value.length, 'campuses,', buildings.value.length, 'buildings,', rooms.value.length, 'rooms');
      console.log('campuses data:', JSON.stringify(campuses.value, null, 2));
      console.log('buildings data:', JSON.stringify(buildings.value, null, 2));
      console.log('rooms data:', JSON.stringify(rooms.value, null, 2));
    } else {
      console.warn('getBaseData returned non-zero code', res);
    }
  } catch (e) {
    console.error('loadBaseData failed', e);
    ElMessage.error('加载基础数据失败，请检查后端或网络');
  }
};

// 2. 级联逻辑
const handleCampusChange = () => {
  selectedBuilding.value = '';
  selectedRoom.value = '';
  seats.value = [];
};

const handleBuildingChange = () => {
  selectedRoom.value = '';
  seats.value = [];
};

// 开始时间变化时自动修正结束时间
const onStartTimeChange = () => {
  if (query.value.end_time <= query.value.start_time) {
    const idx = allTimeSlots.indexOf(query.value.start_time);
    query.value.end_time = allTimeSlots[idx + 1] || allTimeSlots[allTimeSlots.length - 1];
  }
  fetchSeats();
};

// 3. 获取座位数据
const fetchSeats = async () => {
  if (!selectedRoom.value) return;
  
  try {
    const res = await seatApi.getRoomSeats(selectedRoom.value, query.value);
    if (res && res.code === 0) {
      // 兼容后端返回格式差异，确保 seats 始终为数组
      const candidate = (res.data && res.data.data) ?? res.data ?? [];
      const raw = Array.isArray(candidate) ? candidate : [];
      // 规范化字段：后端使用 `status`/`power_socket` 等
      seats.value = raw.map(s => ({
        id: s.id ?? s._id ?? s.seat_id,
        code: s.code ?? s.name ?? s.code ?? '',
        row: s.row ?? s.r ?? 1,
        col: s.col ?? s.c ?? 1,
        booking_status: s.booking_status ?? s.status ?? 'available',
        power_socket: s.power_socket ?? s.power ?? false,
        // 保留其他原始字段
        ...s
      }));
      selectedSeatId.value = null; // 切换时间重置选中
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('加载座位失败');
  }
};

// 4. 座位点击交互
const handleSeatClick = (seat) => {
  if (seat.booking_status !== 'available') {
    ElMessage.warning(`座位 ${seat.code} 不可预约 (${seat.booking_status})`);
    return;
  }
  
  // 切换选中状态
  if (selectedSeatId.value === seat.id) {
    selectedSeatId.value = null;
  } else {
    selectedSeatId.value = seat.id;
  }
};

// 5. 提交预约
const submitReservation = async () => {
  if (!selectedSeatId.value) return;

  if (isBlacklisted.value) {
    ElMessage.error('您当前在黑名单中，暂不可预约');
    return;
  }

  if (query.value.start_time >= query.value.end_time) {
    ElMessage.warning('开始时间必须早于结束时间');
    return;
  }

  try {
    const payload = {
      room_id: selectedRoom.value,
      seat_id: Number.isNaN(Number(selectedSeatId.value)) ? selectedSeatId.value : Number(selectedSeatId.value),
      date: query.value.date,
      start_time: query.value.start_time,
      end_time: query.value.end_time
    };
    console.log('createReservation payload:', payload);
    const token = localStorage.getItem('access_token');
    if (!token) {
      ElMessage.error('请先登录再预约');
      return;
    }

    const resp = await seatApi.createReservation(payload);
    console.log('createReservation response:', resp);
    ElMessage.success('预约成功！');
    fetchSeats(); // 刷新状态
  } catch (error) {
    console.error('createReservation error full:', error);
    const respData = error?.response?.data;
    console.error('createReservation error.response.data:', respData);
    const msg = respData?.message || respData?.code || error.message || '预约失败';
    ElMessage.error(msg);
  }
};

// 检查当前用户是否在黑名单中
const checkUserBlacklist = async () => {
  try {
    const userInfoRaw = localStorage.getItem('user_info');
    if (!userInfoRaw) return; // 未登录或无用户信息
    const user = JSON.parse(userInfoRaw || '{}');
    // 获取多种可能的 id 字段
    const possibleIds = [user.id, user.studentId, user.student_id, user.student_id?.toString(), user.id?.toString()].filter(Boolean);
    if (possibleIds.length === 0) return;

    const res = await getBlacklist();
    const list = (res?.data?.data) ?? res?.data ?? [];
    // 黑名单项通常包含 id 字段（学号）或 student_id
    const inList = list.some(item => {
      const itemIds = [item.id, item.studentId, item.student_id, item.student_id?.toString(), item.id?.toString()].filter(Boolean);
      return possibleIds.some(pid => itemIds.includes(pid));
    });
    isBlacklisted.value = !!inList;
  } catch (e) {
    console.error('checkUserBlacklist failed', e);
  }
};

onMounted(() => {
  // 每次进入页面时重置日期为当天
  query.value.date = new Date().toISOString().split('T')[0];
  loadBaseData();
  checkUserBlacklist();
});
</script>

<style scoped>
.booking-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 筛选栏样式 */
.filter-panel {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

select, input[type="date"] {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

select:focus, input[type="date"]:focus {
  border-color: #409eff;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.legend .tag {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}
.tag.available { background: #67c23a; }
.tag.occupied { background: #f56c6c; }
.tag.maintenance { background: #909399; }
.tag.selected { background: #409eff; }

/* 座位图核心样式 */
.seat-map-wrapper {
  text-align: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.seat-grid {
  display: grid;
  margin: 30px auto;
  position: relative;
}

.seat-card {
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

/* 状态样式 */
.seat-card.available {
  background: #f0f9eb;
  border-color: #c2e7b0;
  color: #67c23a;
}
.seat-card.available:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.seat-card.occupied {
  background: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
  cursor: not-allowed;
}

.seat-card.maintenance {
  background: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
  cursor: not-allowed;
  text-decoration: line-through;
}

.seat-card.is-selected {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
  font-weight: bold;
}

/* 插座标识 */
.socket-indicator {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  color: #e6a23c;
}

/* 底部确认栏 */
.bottom-confirm {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
}

.btn-confirm {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.btn-confirm:hover {
  background: #66b1ff;
}
</style>