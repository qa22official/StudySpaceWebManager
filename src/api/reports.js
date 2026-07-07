import request from './index'; // 确保路径指向你的 axios 实例 (index.js)

/**
 * 获取使用率报表数据
 * @param {Object} params - 查询参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 */
export function getUsageReport(params) {
  return request({
    url: '/reports/usage',
    method: 'get',
    params: params // axios 会自动将对象转换为 ?start_date=...&end_date=...
  });
}