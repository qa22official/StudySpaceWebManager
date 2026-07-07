import request from './index';

// 学生登录：接收外部传入的 data 对象
export function studentLogin(data) {
  return request({
    url: '/auth/student/login',
    method: 'post',
    data: data // 这里会接收来自 Vue 组件的参数
  });
}

// 管理员登录
export function adminLogin(data) {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data: data
  });
}