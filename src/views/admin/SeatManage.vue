<template>
  <div>
    <h2>座位管理</h2>
    
    <!-- 1. 筛选 -->
    <div class="filters">
      <select v-model="query.campus" @change="fetchRooms">
        <option value="">选择校区</option>
        <option value="翔安校区">翔安校区</option>
        <option value="思明校区">思明校区</option>
      </select>
      <select v-model="query.building" @change="fetchRooms">
        <option value="">选择楼栋</option>
        <option v-for="b in buildings" :key="b" :value="b">{{ b }}</option>
      </select>
      <select v-model="query.floor" @change="fetchRooms">
        <option value="">选择楼层</option>
        <option v-for="n in 10" :key="n" :value="n">{{ n }} 层</option>
      </select>
    </div>

    <!-- 2. 自习室列表 -->
    <div class="room-list">
      <div v-for="room in rooms" :key="room.id" class="room-card" @click="selectRoom(room)">
        <h4>{{ room.name }}</h4>
        <p>总座位: {{ room.total_seats }}</p>
      </div>
    </div>

    <!-- 3. 座位管理模态框 -->
    <div v-if="selectedRoom" class="modal">
      <div class="modal-content">
        <h3>管理座位 - {{ selectedRoom.name }}</h3>
        
        <div class="actions">
          <button @click="openRegenerateModal">重置座位布局</button>
        </div>

        <!-- 座位网格 -->
        <div class="seat-grid">
          <div v-for="seat in seats" :key="seat.id" 
               class="seat" 
               :class="{ 'available': seat.status === 'available', 'maintenance': seat.status === 'maintenance', 'selected': seat.id === selectedSeat?.id }"
               @click="selectSeat(seat)">
            {{ seat.code }}
          </div>
        </div>

        <!-- 选中座位的操作 -->
        <div v-if="selectedSeat" class="seat-actions">
          <h4>修改座位属性: {{ selectedSeat.code }}</h4>
          <label>
            <input type="checkbox" v-model="selectedSeat.power_socket" @change="updateSeat"> 有电源
          </label>
          <select v-model="selectedSeat.status" @change="updateSeat">
            <option value="available">可用</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>

        <button @click="selectedRoom = null">关闭</button>
      </div>
    </div>

    <!-- 4. 重置座位布局模态框 -->
    <div v-if="showRegenerateModal" class="modal">
      <div class="modal-content">
        <h3>重置座位布局</h3>
        <p>这将删除所有现有座位并重新生成。</p>
        <input type="number" v-model="regenerateForm.total_seats" placeholder="总座位数" />
        <input type="number" v-model="regenerateForm.columns" placeholder="列数" />
        <div class="modal-actions">
          <button @click="regenerateSeats">确认重置</button>
          <button @click="showRegenerateModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import request from '../../api';

const query = reactive({ campus: '', building: '', floor: '' });
const buildings = ['德望图书馆', '一号楼-学武楼', '二号楼-坤銮楼'];
const rooms = ref([]);
const selectedRoom = ref(null);
const seats = ref([]);
const selectedSeat = ref(null);

const showRegenerateModal = ref(false);
const regenerateForm = reactive({ total_seats: 24, columns: 6 });

const fetchRooms = async () => {
  if (!query.campus) return;
  const res = await request.get('/rooms', { params: query });
  rooms.value = res.data.data;
};

const selectRoom = async (room) => {
  selectedRoom.value = room;
  // 获取座位详情，需要一个日期和时间，这里用一个默认值
  const res = await request.get(`/rooms/${room.id}/seats`, {
    params: { date: '2026-07-05', start_time: '09:00', end_time: '10:00' }
  });
  seats.value = res.data.data;
};

const selectSeat = (seat) => {
  selectedSeat.value = seat;
};

const updateSeat = async () => {
  try {
    await request.patch(`/admin/seats/${selectedSeat.value.id}`, {
      status: selectedSeat.value.status,
      power_socket: selectedSeat.value.power_socket
    });
    // 可以在这里加一个成功提示
  } catch (e) {
    alert('更新失败: ' + e.response.data.message);
  }
};

const openRegenerateModal = () => {
  showRegenerateModal.value = true;
};

const regenerateSeats = async () => {
  try {
    await request.post(`/admin/rooms/${selectedRoom.value.id}/seats/regenerate`, regenerateForm);
    alert('座位布局已重置');
    showRegenerateModal.value = false;
    selectRoom(selectedRoom.value); // 重新加载座位
  } catch (e) {
    alert('重置失败: ' + e.response.data.message);
  }
};
</script>

<style scoped>
/* 样式同 BookSeat.vue，增加 .maintenance 样式 */
.seat.maintenance { background: #9e9e9e; color: white; }
.seat-actions { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
</style>