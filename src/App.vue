<template>
  <!-- 路由视图：页面内容会根据路由变化显示在这里 -->
  <router-view />
</template>

<script setup>
// 这里通常不需要写逻辑，除非有全局的初始化操作
// 比如检查 Token 是否存在，或者设置全局样式变量
</script>

<style>
/* 全局样式重置，防止不同浏览器显示不一致 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f7fa; /* 给整个系统一个浅灰背景 */
}

/* 去除默认的下划线等 */
a {
  text-decoration: none;
  color: inherit;
}
</style>
