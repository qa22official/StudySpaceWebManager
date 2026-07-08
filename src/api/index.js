import axios from 'axios';

// 根据文档，线上地址如下，本地调试可改为 http://127.0.0.1:5000/api
const baseURL = 'https://roomapi.tomorrowbetter.online/api'; 

const request = axios.create({
  baseURL,
  timeout: 5000,
});

// 请求拦截器：自动携带 Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default request;