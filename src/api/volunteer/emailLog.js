import request from '@/utils/request'

// 查询邮箱历史列表
export function listEmailLog(query) {
  return request({
    url: '/volunteer/emailLog/list',
    method: 'get',
    params: query
  })
}

// 查询邮箱历史详细
export function getEmailLog(id) {
  return request({
    url: '/volunteer/emailLog/' + id,
    method: 'get'
  })
}

// 新增邮箱历史
export function addEmailLog(data) {
  return request({
    url: '/volunteer/emailLog',
    method: 'post',
    data: data
  })
}

// 修改邮箱历史
export function updateEmailLog(data) {
  return request({
    url: '/volunteer/emailLog',
    method: 'put',
    data: data
  })
}

// 删除邮箱历史
export function delEmailLog(id) {
  return request({
    url: '/volunteer/emailLog/' + id,
    method: 'delete'
  })
}
