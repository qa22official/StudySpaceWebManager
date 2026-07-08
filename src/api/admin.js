
import request from './index'; // 引用同目录下的 axios 实例

/**
 * ==========================================
 * 1. 基础数据管理 (校区、楼栋、自习室)
 * ==========================================
 */

// --- 校区管理 (Campuses) ---
export function getCampusList(params) {
  return request({ url: '/campuses', method: 'get', params });
}
export function createCampus(data) {
  return request({ url: '/campuses', method: 'post', data });
}
export function updateCampus(id, data) {
  return request({ url: `/campuses/${id}`, method: 'put', data });
}
export function deleteCampus(id) {
  return request({ url: `/campuses/${id}`, method: 'delete' });
}

// --- 楼栋管理 (Buildings) ---
export function getBuildingList(params) {
  return request({ url: '/buildings', method: 'get', params });
}
export function createBuilding(data) {
  return request({ url: '/buildings', method: 'post', data });
}
export function updateBuilding(id, data) {
  return request({ url: `/buildings/${id}`, method: 'put', data });
}
export function deleteBuilding(id) {
  return request({ url: `/buildings/${id}`, method: 'delete' });
}

// --- 自习室管理 (Rooms) ---
export function getRoomList(params) {
  return request({ url: '/rooms', method: 'get', params });
}
export function createRoom(data) {
  return request({ url: '/rooms', method: 'post', data });
}
export function updateRoom(id, data) {
  return request({ url: `/rooms/${id}`, method: 'put', data });
}
export function deleteRoom(id) {
  return request({ url: `/rooms/${id}`, method: 'delete' });
}

/**
 * ==========================================
 * 2. 座位与布局管理 (Seats & Layouts)
 * ==========================================
 */

// 获取某自习室的座位详情（用于查看状态或编辑布局）
export function getRoomSeats(roomId, params) {
  return request({
    url: `/rooms/${roomId}/seats`,
    method: 'get',
    params
  });
}

// 更新座位布局（例如：修改座位坐标、批量生成座位图）
export function updateRoomLayout(roomId, data) {
  return request({
    url: `/rooms/${roomId}/layout`,
    method: 'put',
    data
  });
}

// 单点修改座位信息（例如：修改座位号、标记维修中）
export function updateSeatInfo(roomId, seatId, data) {
  return request({
    url: `/rooms/${roomId}/seats/${seatId}`,
    method: 'put',
    data
  });
}

/**
 * ==========================================
 * 3. 预约管理与特殊操作 (Reservations & Actions)
 * ==========================================
 */

// 后台扫描
export function runBackgroundScan() {
  return request({
    url: '/admin/tasks/release-overdue',
    method: 'post'
  })
}

// 手动释放座位
export function manualReleaseSeat(reservationId, reason = '') {
  return request({
    url: `/admin/reservations/${reservationId}/release`,
    method: 'post',
    data: { reason }
  })
}