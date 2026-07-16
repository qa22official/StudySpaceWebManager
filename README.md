
# 智能校园自习室预约管理平台 — Web 前端

> 一个基于 **Vue 3 + Vite + Element Plus** 的校园自习室预约管理系统，支持**学生端**与**管理员端**双角色操作。

后端仓库地址：<https://github.com/Fhit-head/Study-space-reservation>

---

## 功能概览

###  学生端

| 模块 | 说明 |
|------|------|
| 登录 / 修改密码 | 学号 + 密码登录，支持在线修改密码 |
| 个人信息 | 查看个人基本信息（姓名、学院、专业等） |
| 预约座位 | 按校区 → 楼栋 → 自习室 → 座位层级选择，选择日期与时段进行预约 |
| 我的预约 | 查看当前有效预约，支持**签到**和**取消**操作 |
| 历史记录 | 浏览历史预约记录 |

###  管理员端

| 模块 | 说明 |
|------|------|
| 登录 | 管理员账号登录 |
| 工作台 | 按自习室查看实时座位热力图，直观掌握入座率 |
| 学生管理 | 学生信息的增删改查，支持按姓名/状态筛选 |
| 座位管理 | 校区、楼栋、自习室三级基础数据的增删改查 |
| 预约管理 | 查看所有学生的预约记录，可进行管理操作 |
| 数据报表 | 按日期范围查询自习室使用率统计 |
| 黑名单管理 | 管理违规学生黑名单 |
| 个人信息 | 查看管理员个人信息 |

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | ^3.5 |
| 构建工具 | Vite | ^8.0 |
| 路由 | Vue Router | ^5.1 |
| 状态管理 | Pinia | ^3.0 |
| UI 组件库 | Element Plus | ^2.14 |
| HTTP 客户端 | Axios | ^1.18 |
| 开发工具 | vite-plugin-vue-devtools | ^8.1 |

---

## 项目结构

```
study-room-admin/
├── index.html                  # 入口 HTML
├── package.json                # 依赖与脚本
├── vite.config.js              # Vite 构建配置
├── env.d.ts                    # TypeScript 环境声明
├── API.md                      # 后端 API 接口文档
├── public/                     # 静态资源
└── src/
    ├── main.js                 # 应用入口，挂载插件
    ├── App.vue                 # 根组件
    ├── style.css               # 全局样式
    ├── api/                    # API 请求层
    │   ├── index.js            # Axios 实例与拦截器
    │   ├── auth.js             # 认证接口（登录/修改密码）
    │   ├── admin.js            # 基础数据管理（校区/楼栋/自习室）
    │   ├── student.js          # 学生管理 & 黑名单
    │   ├── seat.js             # 座位查询
    │   ├── reservation.js      # 预约/签到/取消
    │   ├── dashboard.js        # 看板热力图
    │   └── reports.js          # 使用率报表
    ├── router/
    │   └── index.js            # 路由配置 & 导航守卫
    ├── assets/                 # 静态资源（图片等）
    └── views/                  # 页面组件
        ├── LoginView.vue       # 登录页
        ├── student/            # 学生端页面
        │   ├── StudentLayout.vue
        │   ├── BookSeat.vue    # 预约座位
        │   ├── MyReservations.vue # 我的预约
        │   ├── History.vue     # 历史记录
        │   └── Profile.vue     # 个人信息
        └── admin/              # 管理员端页面
            ├── AdminLayout.vue
            ├── Dashboard.vue   # 工作台
            ├── StudentManage.vue  # 学生管理
            ├── SeatManage.vue  # 座位管理
            ├── AdminReservationList.vue # 预约管理
            ├── Reports.vue     # 数据报表
            ├── Blacklist.vue   # 黑名单
            └── ProfileView.vue # 个人信息
```

---

## 快速开始

### 环境要求

- **Node.js** `^22.18.0` 或 `>=24.12.0`
- **npm** 或 **pnpm**（推荐）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认会在 `http://localhost:5173` 启动开发服务器。

### 构建生产版本

```bash
npm run build
```

构建产物输出至 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

---

## API 配置

API 基础地址在 `src/api/index.js` 中配置：

```js
const baseURL = 'https://roomapi.tomorrowbetter.online/api';
```

本地调试时，可改为：

```js
const baseURL = 'http://127.0.0.1:5000/api';
```

所有需要鉴权的请求会自动在请求头中携带 `Authorization: Bearer <access_token>`。

---

## 路由设计

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录页 | 公开 |
| `/student/profile` | 个人信息 | 学生 |
| `/student/book` | 预约座位 | 学生 |
| `/student/my-seat` | 我的预约 | 学生 |
| `/student/history` | 历史记录 | 学生 |
| `/admin/dashboard` | 工作台 | 管理员 |
| `/admin/students` | 学生管理 | 管理员 |
| `/admin/seats` | 座位管理 | 管理员 |
| `/admin/reservations` | 预约管理 | 管理员 |
| `/admin/reports` | 数据报表 | 管理员 |
| `/admin/blacklist` | 黑名单 | 管理员 |
| `/admin/profile` | 个人信息 | 管理员 |

路由守卫会根据 `localStorage` 中的 `access_token` 和 `role` 自动判断登录状态与角色权限。

---

## 后端仓库

后端使用 **Flask** 构建，提供 RESTful API，详见：

👉 <https://github.com/Fhit-head/Study-space-reservation>

完整 API 接口文档见项目根目录下的 [`API.md`](./API.md)。
