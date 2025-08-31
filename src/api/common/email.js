import request from '@/utils/request'

// 查询邮箱历史列表
export function listLog(query) {
  return request({
    url: '/system/log/list',
    method: 'get',
    params: query
  })
}

// 查询邮箱历史详细
export function getLog(id) {
  return request({
    url: '/system/log/' + id,
    method: 'get'
  })
}

// 新增邮箱历史
export function addLog(data) {
  return request({
    url: '/system/log',
    method: 'post',
    data: data
  })
}

// 修改邮箱历史
export function updateLog(data) {
  return request({
    url: '/system/log',
    method: 'put',
    data: data
  })
}

// 删除邮箱历史
export function delLog(id) {
  return request({
    url: '/system/log/' + id,
    method: 'delete'
  })
}
