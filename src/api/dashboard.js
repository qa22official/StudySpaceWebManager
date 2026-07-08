<<<<<<< HEAD
// src/api/dashboard.js
import request from './index'; 
=======
import request from './index'; // 确保路径指向你的 axios 实例 (index.js)
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55

/**
 * 获取实时看板热力图数据
 * @param {number|string} roomId - 自习室ID
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
<<<<<<< HEAD
 * @param {string} time - 时间字符串 (HH:MM) - [新增]
 */
export function getRoomHeatmap(roomId, date, time) {
=======
 */
export function getRoomHeatmap(roomId, date) {
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
  return request({
    url: `/dashboard/rooms/${roomId}`,
    method: 'get',
    params: {
<<<<<<< HEAD
      date: date,
      time: time || '00:00' // 如果没传时间，给个默认值或让后端处理
=======
      date: date
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
    }
  });
}

<<<<<<< HEAD
// 保留原有的 getAllRooms 用于获取房间列表
=======
/**
 * (可选) 如果获取房间列表的接口还没封装，可以在这里加，或者复用已有的 rooms.js
 */
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
export function getAllRooms() {
  return request({
    url: '/rooms',
    method: 'get'
  });
}