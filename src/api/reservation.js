// src/api/reservation.js
import request from './index'; 

/**
 * 1. 学生签到
 */
export function checkInReservation(id) {
  return request({
    url: `/reservations/${id}/check-in`,
    method: 'post'
  });
}

/**
 * 2. 学生取消预约
 */
export function cancelReservation(id, data = {}) {
  return request({
    url: `/reservations/${id}/cancel`,
    method: 'post',
    data: data 
  });
}

/**
 * 3. 查询预约列表 (通用接口)
 */
export function getReservations(params) {
  return request({
    url: '/reservations',
    method: 'get',
    params: params
  });
}

