<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">学生管理</h2>
        <p class="page-subtitle">管理自习室学生账号与权限</p>
      </div>
      <div class="header-right">
        <el-button @click="$router.push('/admin/blacklist')" type="warning" :icon="WarningFilled">
          黑名单管理
        </el-button>
        <el-button @click="openAddModal" type="primary" :icon="Plus">添加学生</el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-card">
      <el-input
        v-model="keyword"
        placeholder="输入姓名或学号搜索..."
        clearable
        @keyup.enter="fetchStudents"
        @clear="fetchStudents"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button @click="fetchStudents" type="primary" :icon="Search">搜索</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="students" stripe border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="学号" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="college" label="学院" min-width="160" />
        <el-table-column prop="major" label="专业" min-width="180" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" effect="plain" size="small">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button @click="openEditModal(row)" type="primary" link size="small">编辑</el-button>
            <el-button @click="handleDelete(row.id)" type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEditMode ? '修改学生信息' : '添加新学生'"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" label-position="top" @submit.prevent="handleSubmit">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学号">
              <el-input v-model="form.id" :disabled="isEditMode" placeholder="例如：20260001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="isEditMode ? '密码 (留空则不修改)' : '密码'">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEditMode ? '留空则不修改密码' : '请输入密码'"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学院">
              <el-input v-model="form.college" placeholder="请输入学院" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业">
              <el-input v-model="form.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常 (Active)" value="active" />
            <el-option label="禁用 (Disabled)" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, WarningFilled } from '@element-plus/icons-vue';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../api/student';

const students = ref([]);
const keyword = ref('');
const showModal = ref(false);
const isEditMode = ref(false);
const tableLoading = ref(false);
const submitLoading = ref(false);

const form = ref({
  id: '',
  name: '',
  password: '',
  college: '',
  major: '',
  status: 'active'
});

const fetchStudents = async () => {
  tableLoading.value = true;
  try {
    const res = await getStudents({ keyword: keyword.value });
    students.value = res.data?.data || [];
  } catch (error) {
    console.error('获取学生列表失败:', error);
    ElMessage.error('获取学生列表失败');
  } finally {
    tableLoading.value = false;
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  form.value = { id: '', name: '', password: '', college: '', major: '', status: 'active' };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditMode.value = true;
  form.value = {
    id: item.id || '',
    name: item.name || '',
    password: '',
    college: item.college || '',
    major: item.major || '',
    status: item.status || 'active'
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  const payload = { ...form.value };

  if (isEditMode.value) {
    if (!payload.password) delete payload.password;
  } else {
    if (!payload.password) {
      ElMessage.warning('请输入密码');
      return;
    }
  }

  submitLoading.value = true;
  try {
    if (isEditMode.value) {
      await updateStudent(payload.id, payload);
    } else {
      await addStudent(payload);
    }
    showModal.value = false;
    fetchStudents();
    ElMessage.success(isEditMode.value ? '修改成功' : '添加成功');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该学生吗？如果有未结束预约将无法删除。', '警告', {
      confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning'
    });
  } catch { return; }

  try {
    await deleteStudent(id);
    ElMessage.success('删除成功');
    fetchStudents();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 10px;
}

.search-card {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  max-width: 360px;
}

.table-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
</style>