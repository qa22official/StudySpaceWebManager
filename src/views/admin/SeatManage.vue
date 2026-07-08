
<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
   <div class="page-header">
  <div class="header-left">
    <h2 class="page-title">座位管理</h2>
    <p class="page-subtitle">管理自习室座位布局与维护状态</p>
  </div>
  <div class="header-right">
    <el-button type="warning" plain @click="handleBackgroundScan">
      后台扫描
    </el-button>
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
    <div class="action-bar" style="margin:12px 0; display:flex; gap:10px;">
      <el-button type="primary" plain @click="openRoomModal()">新增自习室</el-button>
      <el-button type="success" plain @click="openAddBuildingModal">新增楼栋</el-button>
      <el-button type="info" plain @click="openManageRooms">管理自习室</el-button>
      <el-button type="warning" plain @click="openBuildingManager">管理楼栋</el-button>
    </div>

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
  <!-- 手动释放按钮（仅当座位有预约时显示） -->
  <el-row v-if="selectedSeat.reservation_id" style="margin-top: 12px;">
    <el-col :span="24">
      <el-button type="danger" size="small" @click="handleManualRelease(selectedSeat)">
        手动释放座位
      </el-button>
    </el-col>
  </el-row>
</div>
    </el-dialog>

    <!-- 管理自习室弹窗（列表 + 编辑） -->
    <el-dialog v-model="showManageRooms" title="管理自习室" width="900px">
      <div style="display:flex; gap:16px;">
        <div style="flex:1; max-height:520px; overflow:auto;">
          <el-table :data="allRooms" style="width:100%" @row-click="editRoomInManager">
            <el-table-column prop="name" label="名称" />
            <el-table-column label="校区">
              <template #default="{ row }">{{ campusById[row.campus_id]?.name || row.campus_name || row.campus }}</template>
            </el-table-column>
            <el-table-column prop="building_name" label="楼栋" />
            <el-table-column prop="floor" label="楼层" />
            <el-table-column prop="total_seats" label="座位数" />
            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="editRoomInManager(row)">编辑</el-button>
                <el-button type="danger" size="small" @click.stop="removeRoom(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="width:360px;">
          <h4 style="margin-top:0">自习室信息</h4>
          <el-form label-position="top">
            <el-form-item label="名称"><el-input v-model="roomForm.name" /></el-form-item>
            <el-form-item label="校区">
              <el-select v-model="roomForm.campus" clearable>
                <el-option v-for="c in campuses" :key="c.id" :label="c.name" :value="c.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="楼栋">
              <el-select v-model="roomForm.building" clearable>
                <el-option v-for="b in buildingList" :key="b.id" :label="b.name" :value="b.name" />
              </el-select>
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12"><el-form-item label="楼层"><el-input-number v-model="roomForm.floor" :min="1" :max="50" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="座位数"><el-input-number v-model="roomForm.total_seats" :min="1" :max="500" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="开放时间"><el-input v-model="roomForm.open_time" /></el-form-item>
            <el-form-item label="关闭时间"><el-input v-model="roomForm.close_time" /></el-form-item>
            <el-row justify="end" style="margin-top:8px">
              <el-button @click="clearRoomForm">清空</el-button>
              <el-button type="primary" @click="saveRoomManager">保存</el-button>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <!-- 楼栋管理弹窗 -->
    <el-dialog v-model="showBuildingManager" title="楼栋管理" width="800px">
      <div style="display:flex; gap:20px;">
        <div style="flex:1;">
          <h4>楼栋列表</h4>
          <el-table :data="buildingList" style="width:100%">
            <el-table-column prop="name" label="楼栋" />
            <el-table-column label="校区">
              <template #default="{ row }">
                {{ campusById[row.campus_id]?.name || row.campus_name || row.campus_id }}
              </template>
            </el-table-column>
            <el-table-column prop="max_floor" label="最高楼层" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editBuilding(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteBuilding(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="width:320px;">
          <h4>新增/编辑楼栋</h4>
          <el-form label-position="top">
            <el-form-item label="校区">
              <el-select v-model="buildingForm.campus_id" placeholder="选择校区" clearable>
                <el-option v-for="c in campuses" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="楼栋名称">
              <el-input v-model="buildingForm.name" />
            </el-form-item>
            <el-form-item label="最高楼层">
              <el-input-number v-model="buildingForm.max_floor" :min="1" :max="20" />
            </el-form-item>
            <el-row justify="end" style="margin-top:8px">
              <el-button @click="openAddBuilding">清空</el-button>
              <el-button type="primary" @click="saveBuilding">保存</el-button>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <!-- 自习室新增/编辑弹窗 -->
    <el-dialog v-model="showRoomModal" :title="isEditingRoom ? '编辑自习室' : '新增自习室'" width="520px">
      <el-form label-position="top">
        <el-form-item label="校区">
          <el-select v-model="roomForm.campus" placeholder="选择校区" clearable>
            <el-option label="翔安校区" value="翔安校区" />
            <el-option label="思明校区" value="思明校区" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋">
          <el-select v-model="roomForm.building" placeholder="楼栋名称" clearable>
            <el-option v-for="b in buildingList" :key="b.id" :label="b.name" :value="b.name" />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="楼层"><el-input-number v-model="roomForm.floor" :min="1" :max="50" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="总座位数"><el-input-number v-model="roomForm.total_seats" :min="1" :max="500" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="自习室名称"><el-input v-model="roomForm.name" /></el-form-item>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="开放时间"><el-input v-model="roomForm.open_time" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="关闭时间"><el-input v-model="roomForm.close_time" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showRoomModal = false">取消</el-button>
        <el-button v-if="isEditingRoom" type="danger" @click="removeRoom(roomForm)">删除</el-button>
        <el-button type="primary" @click="saveRoom">保存</el-button>
      </template>
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
import { runBackgroundScan, manualReleaseSeat } from '@/api/admin';

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

// 后台扫描
const handleBackgroundScan = async () => {
  try {
    const res = await runBackgroundScan();
    const count = res.data?.released_count ?? res.data?.data?.released_count ?? 0;
    ElMessage.success(`后台扫描完成，已释放 ${count} 个超时座位`);
  } catch (e) {
    ElMessage.error('扫描失败: ' + (e.response?.data?.message || '未知错误'));
  }
};

// 手动释放座位
const handleManualRelease = async (seat) => {
  if (!seat.reservation_id) {
    ElMessage.warning('该座位当前无有效预约');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要释放座位 ${seat.code} 的预约吗？`,
      '释放确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    await manualReleaseSeat(seat.reservation_id, '管理员手动释放');
    ElMessage.success('座位已释放');
    // 刷新当前房间座位列表
    await selectRoom(selectedRoom.value);
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('释放失败: ' + (e.response?.data?.message || '未知错误'));
    }
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

// 楼栋管理
const showBuildingManager = ref(false);
const buildingList = ref([]);
const buildingForm = reactive({ id: '', campus_id: '', name: '', max_floor: 6 });
const showRoomModal = ref(false);
const isEditingRoom = ref(false);
const roomForm = reactive({ id: '', campus: '', building: '', floor: 1, name: '', open_time: '08:00', close_time: '22:30', total_seats: 24 });

const openBuildingManager = async () => {
  showBuildingManager.value = true;
  await Promise.all([loadBuildings(), loadCampuses()]);
};

const openAddBuildingModal = async () => {
  await openBuildingManager();
  openAddBuilding();
};

// 管理自习室逻辑
const showManageRooms = ref(false);
const allRooms = ref([]);

const openManageRooms = async () => {
  showManageRooms.value = true;
  await Promise.all([loadBuildings(), loadCampuses(), loadAllRooms()]);
};

const loadAllRooms = async () => {
  try {
    const res = await request.get('/rooms');
    allRooms.value = res.data?.data || res.data || [];
  } catch (e) { ElMessage.error('获取自习室列表失败'); }
};

const editRoomInManager = (room) => {
  isEditingRoom.value = true;
  roomForm.id = room.id;
  roomForm.campus = room.campus_name || room.campus || query.campus || '';
  roomForm.building = room.building_name || room.building || '';
  roomForm.floor = room.floor || 1;
  roomForm.name = room.name || '';
  roomForm.open_time = room.open_time || '08:00';
  roomForm.close_time = room.close_time || '22:30';
  roomForm.total_seats = room.total_seats || 24;
};

const clearRoomForm = () => {
  isEditingRoom.value = false;
  roomForm.id = '';
  roomForm.name = '';
  roomForm.campus = '';
  roomForm.building = '';
  roomForm.floor = 1;
  roomForm.open_time = '08:00';
  roomForm.close_time = '22:30';
  roomForm.total_seats = 24;
};

const saveRoomManager = async () => {
  await saveRoom();
  await loadAllRooms();
};

const loadBuildings = async () => {
  try {
    const res = await request.get('/buildings');
    buildingList.value = res.data?.data || res.data || [];
  } catch (e) { ElMessage.error('获取楼栋失败'); }
};

// 校区列表，用于楼栋创建时选择 campus_id
const campuses = ref([]);
const campusById = ref({});

const loadCampuses = async () => {
  try {
    const res = await request.get('/campuses');
    campuses.value = res.data?.data || res.data || [];
    const map = {};
    for (const c of campuses.value) map[c.id] = c;
    campusById.value = map;
  } catch (e) { campuses.value = []; campusById.value = {}; }
};

const openAddBuilding = () => {
  buildingForm.id = '';
  buildingForm.campus_id = campuses.value[0]?.id || '';
  buildingForm.name = '';
  buildingForm.max_floor = 6;
};

const saveBuilding = async () => {
  try {
    if (!buildingForm.name) { ElMessage.warning('请填写楼栋名称'); return; }
    if (buildingForm.id) {
      await request.patch(`/admin/buildings/${buildingForm.id}`, { name: buildingForm.name, max_floor: buildingForm.max_floor });
      ElMessage.success('楼栋已更新');
    } else {
      await request.post('/admin/buildings', { campus_id: buildingForm.campus_id || '', name: buildingForm.name, max_floor: buildingForm.max_floor });
      ElMessage.success('楼栋已创建');
    }
    await loadBuildings();
    fetchBuildings();
  } catch (e) { ElMessage.error('保存失败: ' + (e.response?.data?.message || '未知错误')); }
};

const editBuilding = (b) => {
  buildingForm.id = b.id;
  buildingForm.campus_id = b.campus_id || '';
  buildingForm.name = b.name || '';
  buildingForm.max_floor = b.max_floor || 6;
};

const deleteBuilding = async (b) => {
  try {
    await request.delete(`/admin/buildings/${b.id}`);
    ElMessage.success('楼栋已删除');
    await loadBuildings();
    fetchBuildings();
  } catch (e) { ElMessage.error('删除失败: ' + (e.response?.data?.message || '未知错误')); }
};

// 自习室 CRUD
const openRoomModal = (room = null) => {
  if (room) {
    isEditingRoom.value = true;
    roomForm.id = room.id;
    roomForm.campus = room.campus_name || room.campus || query.campus || '';
    roomForm.building = room.building_name || room.building || query.building || '';
    roomForm.floor = room.floor || 1;
    roomForm.name = room.name || '';
    roomForm.open_time = room.open_time || '08:00';
    roomForm.close_time = room.close_time || '22:30';
    roomForm.total_seats = room.total_seats || 24;
  } else {
    isEditingRoom.value = false;
    roomForm.id = '';
    roomForm.campus = query.campus || '';
    roomForm.building = query.building || '';
    roomForm.floor = query.floor || 1;
    roomForm.name = '';
    roomForm.open_time = '08:00';
    roomForm.close_time = '22:30';
    roomForm.total_seats = 24;
  }
  showRoomModal.value = true;
};

const saveRoom = async () => {
  try {
    if (!roomForm.name || !roomForm.building || !roomForm.campus) { ElMessage.warning('请填写完整自习室信息'); return; }
    const payload = {
      campus: roomForm.campus,
      building: roomForm.building,
      floor: Number(roomForm.floor),
      name: roomForm.name,
      open_time: roomForm.open_time,
      close_time: roomForm.close_time,
      total_seats: Number(roomForm.total_seats)
    };
    const res = isEditingRoom.value && roomForm.id
      ? await request.patch(`/rooms/${roomForm.id}`, payload)
      : await request.post('/rooms', payload);
    ElMessage.success(isEditingRoom.value ? '自习室已更新' : '自习室已创建');
    showRoomModal.value = false;
    await Promise.all([loadAllRooms(), loadBuildings()]);
    if (query.campus) {
      rooms.value = allRooms.value.filter(r => (r.campus_name || r.campus) === query.campus);
    } else {
      rooms.value = allRooms.value.slice();
    }
    const updatedId = roomForm.id || (res?.data?.data?.id) || (res?.data?.id);
    if (selectedRoom.value && updatedId && selectedRoom.value.id === updatedId) {
      const updatedRoom = allRooms.value.find(r => r.id === updatedId);
      if (updatedRoom) {
        selectedRoom.value = updatedRoom;
        await selectRoom(updatedRoom);
      }
    }
  } catch (e) { ElMessage.error('保存失败: ' + (e.response?.data?.message || '未知错误')); }
};

const removeRoom = async (room) => {
  try {
    await request.delete(`/rooms/${room.id}`);
    ElMessage.success('自习室已删除');
    await loadAllRooms();
    if (query.campus) {
      rooms.value = allRooms.value.filter(r => (r.campus_name || r.campus) === query.campus);
    } else {
      rooms.value = allRooms.value.slice();
    }
  } catch (e) { ElMessage.error('删除失败: ' + (e.response?.data?.message || '未知错误')); }
};

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