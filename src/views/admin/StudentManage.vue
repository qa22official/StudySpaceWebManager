<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>学生管理</h2>
      <div class="btn-group">
        <!-- 黑名单跳转按钮 -->
        <router-link to="/admin/blacklist">
          <button class="btn-warning">黑名单管理</button>
        </router-link>
        <button @click="openAddModal" class="btn-primary">添加学生</button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="keyword" 
        placeholder="输入姓名或学号搜索..." 
        @keyup.enter="fetchStudents"
      />
      <button @click="fetchStudents">搜索</button>
    </div>

    <!-- 表格 -->
    <table class="data-table">
      <thead>
        <tr>
          <th>学号</th>
          <th>姓名</th>
          <th>学院</th>
          <th>专业</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in students" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.college }}</td>
          <td>{{ item.major }}</td>
          <td>
            <span :class="['status-tag', item.status === 'active' ? 'active' : 'disabled']">
              {{ item.status === 'active' ? '正常' : '禁用' }}
            </span>
          </td>
          <td>
            <button @click="openEditModal(item)" class="btn-sm">编辑</button>
            <button @click="handleDelete(item.id)" class="btn-sm danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 弹窗 (添加/编辑) -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditMode ? '修改学生信息' : '添加新学生' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-item">
            <label>学号</label>
            <input v-model="form.id" :disabled="isEditMode" required placeholder="例如：20260001" />
          </div>
          <div class="form-item">
            <label>姓名</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-item">
            <label>密码 {{ isEditMode ? '(留空则不修改)' : '' }}</label>
            <input v-model="form.password" :required="!isEditMode" type="password" />
          </div>
          <div class="form-item">
            <label>学院</label>
            <input v-model="form.college" />
          </div>
          <div class="form-item">
            <label>专业</label>
            <input v-model="form.major" />
          </div>
          <div class="form-item">
            <label>状态</label>
            <select v-model="form.status">
              <option value="active">正常 (Active)</option>
              <option value="disabled">禁用 (Disabled)</option>
            </select>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showModal = false">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 引入刚才定义的 API
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../api/student';

const students = ref([]);
const keyword = ref('');
const showModal = ref(false);
const isEditMode = ref(false);

// 表单数据模型，严格对应文档字段
const form = ref({
  id: '',
  name: '',
  password: '',
  college: '',
  major: '',
  status: 'active'
});

// 获取列表
const fetchStudents = async () => {
  try {
    const res = await getStudents({ keyword: keyword.value });
    // 假设后端返回结构为 { code: 200, data: [...] }
    students.value = res.data.data || [];
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

// 打开添加弹窗
const openAddModal = () => {
  isEditMode.value = false;
  form.value = { id: '', name: '', password: '', college: '', major: '', status: 'active' };
  showModal.value = true;
};

// 打开编辑弹窗
const openEditModal = (item) => {
  isEditMode.value = true;
  // 复制对象，避免直接修改表格数据
  form.value = { ...item, password: '' }; 
  showModal.value = true;
};

// 提交保存
const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      // PATCH /admin/students/{id}
      await updateStudent(form.value.id, form.value);
    } else {
      // POST /admin/students
      await addStudent(form.value);
    }
    showModal.value = false;
    fetchStudents(); // 刷新列表
    alert(isEditMode.value ? '修改成功' : '添加成功');
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

// 删除学生
const handleDelete = async (id) => {
  if (!confirm('确定要删除该学生吗？如果有未结束预约将无法删除。')) return;
  
  try {
    await deleteStudent(id);
    fetchStudents();
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
/* 简单样式，保持页面整洁 */
.page-container { padding: 20px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-group { display: flex; gap: 10px; }
.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
.search-bar input { padding: 8px; width: 300px; border: 1px solid #ddd; border-radius: 4px; }

.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.data-table th, .data-table td { border: 1px solid #eee; padding: 12px; text-align: left; }
.data-table th { background-color: #f8f9fa; }

.status-tag.active { color: green; font-weight: bold; }
.status-tag.disabled { color: red; }

.btn-sm { padding: 4px 8px; cursor: pointer; margin-right: 5px; }
.danger { background-color: #ffebeb; color: red; border: 1px solid red; border-radius: 4px; }
.btn-primary { background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-warning { background-color: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; }

/* 弹窗样式 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 30px; border-radius: 8px; width: 500px; }
.form-item { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-item label { margin-bottom: 5px; font-weight: bold; font-size: 0.9em; }
.form-item input, .form-item select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
</style>