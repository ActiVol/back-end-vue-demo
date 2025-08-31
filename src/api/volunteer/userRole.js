import request from '@/utils/request'

// 查询用户角色审核列表
export function listUserRole(query) {
  return request({
    url: '/volunteer/userRole/list',
    method: 'get',
    params: query
  })
}

// 查询用户角色审核详细
export function getUserRole(id) {
  return request({
    url: '/volunteer/userRole/' + id,
    method: 'get'
  })
}


// 修改用户角色审核
export function approval(data) {
  return request({
    url: '/volunteer/userRole/approval',
    method: 'put',
    data: data
  })
}


