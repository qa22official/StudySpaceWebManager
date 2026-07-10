import { createRouter, createWebHistory } from 'vue-router';

// 引入布局组件
import LoginView from '../views/LoginView.vue'; 
import StudentLayout from '../views/student/StudentLayout.vue';
import AdminLayout from '../views/admin/AdminLayout.vue';

// 懒加载页面
const Profile = () => import('../views/student/Profile.vue');
const MyReservations = () => import('../views/student/MyReservations.vue');
const BookSeat = () => import('../views/student/BookSeat.vue');
const History = () => import('../views/student/History.vue');

const StudentManage = () => import('../views/admin/StudentManage.vue');
const SeatManage = () => import('../views/admin/SeatManage.vue');
const Dashboard = () => import('../views/admin/Dashboard.vue');
const Reports = () => import('../views/admin/Reports.vue');
const ProfileView = () => import('../views/admin/ProfileView.vue');

// ✅ 新增：引入管理员预约列表组件
const AdminReservationList = () => import('../views/admin/AdminReservationList.vue');

const routes = [
  // 1. 登录页 (放在最前面，不需要嵌套)
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginView 
  },
  
  // 2. 学生路由嵌套
  { 
    path: '/student', 
    component: StudentLayout,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: '/student/profile' }, 
      { path: 'profile', component: Profile },
      { path: 'my-seat', component: MyReservations },
      { path: 'book', component: BookSeat },
      { path: 'history', component: History },
    ]
  },

  // 3. 管理员路由嵌套
  { 
    path: '/admin', 
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' }, 
      { path: 'dashboard', component: Dashboard },
      { path: 'students', component: StudentManage },
      { path: 'seats', component: SeatManage },
      { path: 'reports', component: Reports },
      { path: 'profile', component: ProfileView},
      
      // ✅ 新增：预约记录管理路由
      { 
        path: 'reservations', 
        name: 'AdminReservations',
        component: AdminReservationList 
      },

      {
        path: 'blacklist', 
        name: 'AdminBlacklist',
        component: () => import('../views/admin/Blacklist.vue') 
      },
    ]
  },

  // 4. 根路径处理
  { path: '/', redirect: '/login' }, 
  
  // 5. 404 处理
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// ==========================================
// 🛡️ 核心修复：全局前置守卫
// ==========================================
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('role'); 
  const isLoggedIn = !!token; 

  if (to.path === '/login') {
    if (isLoggedIn) {
      if (userRole === 'admin') return next('/admin/dashboard');
      if (userRole === 'student') return next('/student/profile');
      localStorage.clear();
      return next();
    }
    return next();
  }

  if (!isLoggedIn) {
    return next('/login');
  }

  if (to.meta.role && to.meta.role !== userRole) {
    console.warn(`权限不足：当前是 ${userRole}，试图访问 ${to.meta.role} 的页面`);
    localStorage.clear();
    return next('/login');
  }

  return next();
});

export default router;