import request from './index'; // 确保路径指向你的 axios 实例 (index.js)

/**
 * 获取实时看板热力图数据
 * @param {number|string} roomId - 自习室ID
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 */
export function getRoomHeatmap(roomId, date) {
  return request({
    url: `/dashboard/rooms/${roomId}`,
    method: 'get',
    params: {
      date: date
    }
  });
}

/**
 * (可选) 如果获取房间列表的接口还没封装，可以在这里加，或者复用已有的 rooms.js
 */
export function getAllRooms() {
  return request({
    url: '/rooms',
    method: 'get'
  });
}