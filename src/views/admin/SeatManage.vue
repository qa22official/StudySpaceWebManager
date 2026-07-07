<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">座位管理</h2>
        <p class="page-subtitle">管理自习室座位布局与维护状态</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">校区</label>
          <el-select v-model="query.campus" placeholder="选择校区" @change="fetchRooms" clearable>
            <el-option label="翔安校区" value="翔安校区" />
            <el-option label="思明校区" value="思明校区" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">楼栋</label>
          <el-select v-model="query.building" placeholder="选择楼栋" @change="fetchRooms" clearable>
            <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.name" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">楼层</label>
          <el-select v-model="query.floor" placeholder="选择楼层" @change="fetchRooms" clearable>
            <el-option v-for="n in 10" :key="n" :label="`${n} 层`" :value="n" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 自习室列表 -->
    <div class="room-section" v-if="rooms.length > 0">
      <h3 class="section-title">自习室列表</h3>
      <el-row :gutter="16">
        <el-col v-for="room in rooms" :key="room.id" :xs="24" :sm="12" :md="8" :lg="6">
          <div class="room-card" @click="selectRoom(room)">
            <div class="room-card-header">
              <el-icon size="28"><OfficeBuilding /></el-icon>
            </div>
            <h4 class="room-name">{{ room.name }}</h4>
            <p class="room-seats">总座位：<strong>{{ room.total_seats }}</strong></p>
            <el-tag :type="room.status === 'open' ? 'success' : 'info'" size="small">
              {{ room.status === 'open' ? '开放中' : room.status }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading" description="请选择校区后查看自习室" />

    <!-- 座位管理弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`管理座位 - ${selectedRoom?.name || ''}`"
      width="700px"
      :close-on-click-modal="false"
      @closed="selectedSeat = null"
    >
      <template #header>
        <div class="dialog-header">
          <span>管理座位 - {{ selectedRoom?.name }}</span>
          <el-button @click="openRegenerateModal" type="warning" size="small" :icon="RefreshRight">
            重置座位布局
          </el-button>
        </div>
      </template>

      <!-- 座位网格 -->
      <div class="seat-grid" v-if="seats.length > 0">
        <div
          v-for="seat in seats"
          :key="seat.id"
          class="seat-box"
          :class="{
            available: seat.status === 'available',
            maintenance: seat.status === 'maintenance',
            selected: seat.id === selectedSeat?.id
          }"
          @click="selectSeat(seat)"
        >
          <span class="seat-code">{{ seat.code }}</span>
          <span v-if="seat.power_socket" class="power-icon" title="有电源">⚡</span>
        </div>
      </div>
      <el-empty v-else description="暂无座位数据" :image-size="80" />

      <!-- 座位属性面板 -->
      <div v-if="selectedSeat" class="seat-props">
        <el-divider />
        <h4>修改座位 {{ selectedSeat.code }} 属性</h4>
        <el-row :gutter="20" align="middle">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="selectedSeat.status" @change="updateSeat" style="width:100%">
                <el-option label="可用" value="available" />
                <el-option label="维护中" value="maintenance" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-checkbox
              v-model="selectedSeat.power_socket"
              @change="updateSeat"
              label="有电源插座"
              border
            />
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 重置座位布局弹窗 -->
    <el-dialog v-model="showRegenerateModal" title="重置座位布局" width="400px">
      <el-alert
        title="此操作将删除所有现有座位并重新生成"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="总座位数">
              <el-input-number v-model="regenerateForm.total_seats" :min="1" :max="200" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列数">
              <el-input-number v-model="regenerateForm.columns" :min="1" :max="20" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showRegenerateModal = false">取消</el-button>
        <el-button type="danger" @click="regenerateSeats">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { OfficeBuilding, RefreshRight } from '@element-plus/icons-vue';
import request from '../../api';

const query = reactive({ campus: '', building: '', floor: '' });
const buildings = ref([]);
const rooms = ref([]);
const selectedRoom = ref(null);
const seats = ref([]);
const selectedSeat = ref(null);
const loading = ref(false);

const showRegenerateModal = ref(false);
const regenerateForm = reactive({ total_seats: 24, columns: 6 });
const today = new Date().toISOString().split('T')[0];

const dialogVisible = computed({
  get: () => !!selectedRoom.value,
  set: (val) => { if (!val) selectedRoom.value = null; }
});

const fetchBuildings = async () => {
  try {
    const res = await request.get('/buildings');
    buildings.value = res.data?.data || res.data || [];
  } catch (e) { console.error('获取楼栋失败:', e); }
};

const fetchRooms = async () => {
  if (!query.campus) return;
  loading.value = true;
  try {
    const params = {};
    if (query.campus) params.campus = query.campus;
    if (query.building) params.building = query.building;
    if (query.floor) params.floor = query.floor;
    const res = await request.get('/rooms', { params });
    rooms.value = res.data?.data || res.data || [];
  } catch (e) { ElMessage.error('获取自习室列表失败'); }
  finally { loading.value = false; }
};

const selectRoom = async (room) => {
  selectedRoom.value = room;
  try {
    const res = await request.get(`/rooms/${room.id}/seats`, {
      params: { date: today, start_time: '09:00', end_time: '10:00' }
    });
    seats.value = res.data?.data || res.data || [];
  } catch (e) { ElMessage.error('获取座位列表失败'); }
};

const selectSeat = (seat) => { selectedSeat.value = seat; };

const updateSeat = async () => {
  try {
    await request.patch(`/admin/seats/${selectedSeat.value.id}`, {
      status: selectedSeat.value.status,
      power_socket: selectedSeat.value.power_socket
    });
    ElMessage.success('座位属性已更新');
  } catch (e) {
    ElMessage.error('更新失败: ' + (e.response?.data?.message || '未知错误'));
  }
};

const openRegenerateModal = () => { showRegenerateModal.value = true; };

const regenerateSeats = async () => {
  try {
    await request.post(`/admin/rooms/${selectedRoom.value.id}/seats/regenerate`, regenerateForm);
    ElMessage.success('座位布局已重置');
    showRegenerateModal.value = false;
    selectRoom(selectedRoom.value);
  } catch (e) {
    ElMessage.error('重置失败: ' + (e.response?.data?.message || '未知错误'));
  }
};

onMounted(() => { fetchBuildings(); });
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}
.page-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

/* 筛选栏 */
.filter-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}
.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}
.filter-item .el-select {
  width: 180px;
}

/* 自习室卡片 */
.room-section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}
.room-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.25s;
  margin-bottom: 16px;
}
.room-card:hover {
  border-color: #409eff;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64,158,255,0.15);
}
.room-card-header {
  margin-bottom: 12px;
  color: #409eff;
}
.room-name {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
}
.room-seats {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #909399;
}
.room-seats strong {
  color: #409eff;
  font-size: 16px;
}

/* 座位网格 */
.seat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 20px 0;
}
.seat-box {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  background: #fafafa;
  color: #909399;
  position: relative;
  transition: all 0.2s;
}
.seat-box.available {
  background: #f0f9eb;
  border-color: #c2e7b0;
  color: #67c23a;
}
.seat-box.available:hover {
  background: #e1f3d8;
  transform: translateY(-2px);
}
.seat-box.maintenance {
  background: #f4f4f5;
  border-color: #e9e9eb;
  color: #c0c4cc;
  cursor: not-allowed;
  text-decoration: line-through;
}
.seat-box.selected {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.25);
  font-weight: bold;
}
.seat-code {
  font-size: 12px;
}
.power-icon {
  position: absolute;
  top: 1px;
  right: 3px;
  font-size: 9px;
}

/* 座位属性面板 */
.seat-props {
  margin-top: 8px;
}
.seat-props h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

/* 弹窗头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>