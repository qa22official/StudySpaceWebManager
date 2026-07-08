// src/api/dashboard.js
import request from './index'; 

/**
 * 获取实时看板热力图数据
 * @param {number|string} roomId - 自习室ID
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @param {string} time - 时间字符串 (HH:MM) - [新增]
 */
export function getRoomHeatmap(roomId, date, time) {
  return request({
    url: `/dashboard/rooms/${roomId}`,
    method: 'get',
    params: {
      date: date,
      time: time || '00:00' // 如果没传时间，给个默认值或让后端处理
    }
  });
}

// 保留原有的 getAllRooms 用于获取房间列表
export function getAllRooms() {
  return request({
    url: '/rooms',
    method: 'get'
  });
}