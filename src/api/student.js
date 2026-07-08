import request from './index'; // 严格遵循同级目录引用

/**
 * ================== 2. 管理员管理学生 ==================
 */

// 查询学生 (GET /admin/students)
export function getStudents(params) {
  return request({
    url: '/admin/students',
    method: 'get',
    params: params 
  });
}

// 添加学生 (POST /admin/students)
export function addStudent(data) {
  return request({
    url: '/admin/students',
    method: 'post',
    data: data
  });
}

// 修改学生 (PATCH /admin/students/{student_id})
export function updateStudent(id, data) {
  return request({
    url: `/admin/students/${id}`,
    method: 'patch',
    data: data
  });
}

// 删除学生 (DELETE /admin/students/{student_id})
export function deleteStudent(id) {
  return request({
    url: `/admin/students/${id}`,
    method: 'delete'
  });
}

/**
 * ================== 11. 黑名单管理 ==================
 */

// 查询黑名单 (GET /blacklist)
export function getBlacklist() {
  return request({
    url: '/blacklist',
    method: 'get'
  });
}

// 手动解除黑名单 (DELETE /admin/blacklist/{student_id})
export function removeBlacklist(studentId) {
  return request({
    url: `/admin/blacklist/${studentId}`,
    method: 'delete'
  });
}