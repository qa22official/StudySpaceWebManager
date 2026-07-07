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
      { path: '', redirect: '/student/profile' }, // 进 /student 自动转去 profile
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
      { path: '', redirect: '/admin/dashboard' }, // 进 /admin 自动转去 dashboard
      { path: 'dashboard', component: Dashboard },
      { path: 'students', component: StudentManage },
      { path: 'seats', component: SeatManage },
      { path: 'reports', component: Reports },
      { path: 'profile', component: ProfileView},
      {
        path: 'blacklist', // 对应 /admin/blacklist
        name: 'AdminBlacklist',
        component: () => import('../views/admin/Blacklist.vue') 
      },
    ]
  },

  // 4. 根路径处理 (关键！不要直接 redirect 到具体业务页，交给守卫处理)
  { path: '/', redirect: '/login' }, 
  
  // 5. 404 处理 (可选)
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
  const userRole = localStorage.getItem('role'); // 'student' or 'admin'
  const isLoggedIn = !!token; 

  // --- 情况 A：用户想去登录页 ---
  if (to.path === '/login') {
    if (isLoggedIn) {
      // 如果已经登录了，就别让他看登录页了，直接根据角色送去后台
      // 注意：这里必须写全路径！
      if (userRole === 'admin') return next('/admin/dashboard');
      if (userRole === 'student') return next('/student/profile');
      
      // 极端情况：有 token 但没 role，视为无效登录，清除并放行去登录
      localStorage.clear();
      return next();
    }
    // 没登录，想看登录页 -> 放行
    return next();
  }

  // --- 情况 B：用户想去需要权限的页面 (/admin 或 /student) ---
  if (!isLoggedIn) {
    // 没登录想进后台 -> 踢回登录页
    return next('/login');
  }

  // 已登录，检查角色是否匹配
  if (to.meta.role && to.meta.role !== userRole) {
    console.warn(`权限不足：当前是 ${userRole}，试图访问 ${to.meta.role} 的页面`);
    // 角色不对，踢回登录页重新登录
    localStorage.clear();
    return next('/login');
  }

  // --- 情况 C：验证通过 ---
  return next();
});

export default router;