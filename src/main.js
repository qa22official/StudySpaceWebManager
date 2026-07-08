// src/main.js

import { createApp } from 'vue'
import App from './App.vue' // 引入根组件
import router from './router' // 引入路由配置
import { createPinia } from 'pinia' // 引入 Pinia 状态管理

// 引入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 使用插件
app.use(createPinia()) // 注册 Pinia
app.use(router)        // 注册路由
app.use(ElementPlus)   // 注册 UI 组件库

// 挂载到 index.html 中的 #app 节点
app.mount('#app')