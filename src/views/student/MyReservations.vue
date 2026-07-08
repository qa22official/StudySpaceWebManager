<template>
  <div class="my-reservations-page">
    <h2 class="page-title">我的当前预约</h2>

    <!-- 1. 加载中 -->
    <div v-if="loading" class="status-box loading">
      <p>正在加载您的座位信息...</p>
    </div>

    <!-- 2. 空状态 -->
    <div v-else-if="reservations.length === 0" class="empty-state">
      <div class="icon">🍃</div>
      <h3>当前暂无待使用的预约</h3>
      <p>您目前没有处于“进行中”的座位。</p>
    </div>

    <!-- 3. 列表展示 -->
    <div v-else class="reservation-list">
      <div 
        v-for="item in reservations" 
        :key="item.id" 
        class="card"
      >
        <!-- 顶部状态条 -->
        <div class="card-header">
          <span class="status-tag active">待使用</span>
          <span class="date">{{ item.date }}</span>
        </div>

        <!-- 核心信息 (严格对应 API 字段) -->
        <div class="card-body">
          <div class="info-row">
            <span class="label">自习室：</span>
            <span class="value highlight">{{ getRoomName(item.room_id) }}</span>
          </div>
          <div class="info-row">
            <span class="label">座位号：</span>
            <span class="value highlight">{{ getSeatLabel(item.seat_id) }}</span>
          </div>
          <div class="info-row">
            <span class="label">时间段：</span>
            <span class="value">{{ item.start_time }} - {{ item.end_time }}</span>
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="card-footer">
          <button class="btn btn-cancel" @click="openCancelDialog(item)">
            取消预约
          </button>
          <button class="btn btn-checkin" @click="handleCheckIn(item.id)">
            立即签到
          </button>
        </div>
      </div>
    </div>

    <!-- ⭐ 新增：极简取消理由弹窗 (Element Plus Dialog) -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消预约"
      width="300px"
      :close-on-click-modal="false"
    >
      <p style="margin-bottom: 15px; color: #666;">为了帮助我们要改进服务，请选择取消原因：</p>
      
      <!-- 预设选项，用户点一下就行，不用打字 -->
      <el-radio-group v-model="cancelForm.reason" class="cancel-reasons">
        <el-radio label="临时有事">临时有事</el-radio>
        <el-radio label="行程变更">行程变更</el-radio>
        <el-radio label="找到更好的位置">找到更好的位置</el-radio>
        <el-radio label="其他">其他</el-radio>
      </el-radio-group>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">再想想</el-button>
          <el-button type="danger" @click="confirmCancel" :loading="submitting">
            确认取消
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReservations, checkInReservation, cancelReservation } from '@/api/reservation';
import { getAllRooms } from '@/api/dashboard';

const loading = ref(false);
const reservations = ref([]);
const roomMap = ref({});

const cancelDialogVisible = ref(false);
const currentCancelId = ref(null);
const cancelForm = ref({ reason: '临时有事' });
const submitting = ref(false);

const loadRoomNames = async () => {
  try {
    const res = await getAllRooms();
    const rooms = res.data?.data || res.data || [];
    const map = {};
    rooms.forEach((r) => { map[r.id] = r.name || r.id; });
    roomMap.value = map;
  } catch (e) { console.error('加载自习室名称失败:', e); }
};

const getRoomName = (roomId) => roomMap.value[roomId] || roomId;
const getSeatLabel = (seatId) => {
  if (!seatId) return '-';
  const parts = seatId.split('_seat_');
  return parts.length > 1 ? parts[1] : seatId;
};

const fetchReservations = async () => {
  loading.value = true;
  try {
    const res = await getReservations({ status: 'active' });
    let list = [];
    if (res.data?.data && Array.isArray(res.data.data)) {
      list = res.data.data;
    } else if (res.data && Array.isArray(res.data)) {
      list = res.data;
    } else if (Array.isArray(res)) {
      list = res;
    }
    reservations.value = list;
  } catch (error) {
    console.error('获取预约失败:', error);
    ElMessage.error('加载预约信息失败');
  } finally {
    loading.value = false;
  }
};

// 签到逻辑
const handleCheckIn = async (id) => {
  try {
    await ElMessageBox.confirm('确认已到达座位并签到？', '签到确认', {
      confirmButtonText: '签到',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await checkInReservation(id); // ✅ 使用 API 函数
    ElMessage.success('签到成功！请安心学习。');
    fetchReservations(); // 刷新状态
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '签到失败，请重试');
    }
  }
};

// 打开取消弹窗
const openCancelDialog = (item) => {
  currentCancelId.value = item.id;
  cancelForm.value.reason = '临时有事'; // 重置为默认
  cancelDialogVisible.value = true;
};

// 确认取消
const confirmCancel = async () => {
  submitting.value = true;
  try {
    // ✅ 发送包含 reason 的请求
    await cancelReservation(currentCancelId.value, { reason: cancelForm.value.reason });
    
    ElMessage.success('预约已取消');
    cancelDialogVisible.value = false;
    fetchReservations(); // 刷新列表
    
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '取消失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadRoomNames().then(() => fetchReservations());
});
</script>

<style scoped>
/* 保持原有样式，增加一点弹窗样式 */
.my-reservations-page { padding: 20px; max-width: 600px; margin: 0 auto; }
.page-title { text-align: center; margin-bottom: 24px; color: #333; }

.card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; border: 1px solid #eee; }
.card-header { background: #f8f9fa; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
.status-tag.active { background: #e6f7ff; color: #1890ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.date { color: #666; font-size: 14px; }

.card-body { padding: 16px; }
.info-row { display: flex; margin-bottom: 10px; font-size: 15px; }
.label { color: #888; width: 70px; }
.value { color: #333; font-weight: 500; }
.value.highlight { color: #1890ff; font-weight: bold; }

.card-footer { padding: 12px 16px; border-top: 1px solid #eee; display: flex; gap: 10px; }
.btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
.btn-checkin { background: #1890ff; color: white; }
.btn-cancel { background: #fff; border: 1px solid #ff4d4f; color: #ff4d4f; }

.empty-state { text-align: center; padding: 60px 20px; background: #fafafa; border-radius: 12px; border: 1px dashed #ddd; }
.empty-state .icon { font-size: 48px; margin-bottom: 16px; }

/* 弹窗内的单选框样式优化 */
.cancel-reasons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>