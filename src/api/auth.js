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

// 学生修改密码 (PATCH /auth/student/password)
export function changeStudentPassword(data) {
  return request({
    url: '/auth/student/password',
    method: 'patch',
    data: data
  });
<<<<<<< HEAD
}

/**
 * 获取学生个人信息
 * GET /auth/student/profile
 */
export function getStudentProfile() {
  return request({
    url: '/auth/student/profile',
    method: 'get'
  });
=======
>>>>>>> e66bf7304e86bfe230045863566abd33c8ff3c55
}