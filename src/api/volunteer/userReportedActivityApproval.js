import request from '@/utils/request'

// 查询活动信息列表
export function listSelfRecord(query) {
  return request({
    url: '/activityInfo/selfRecord/list',
    method: 'get',
    params: {
      ...query,  // 展开原有的查询参数
      approveStatus: 2  // 固定添加 approveStatus=2
    }
  })
}
// 查询活动信息详细
export function getSelfRecord(activityId) {
  return request({
    url: '/activityInfo/selfRecord/' + activityId,
    method: 'get'
  })
}

// 新增活动信息
export function addSelfRecord(data) {
  return request({
    url: '/activityInfo/selfRecord',
    method: 'post',
    data: data
  })
}

// 修改活动信息
export function updateSelfRecord(data) {
  return request({
    url: '/activityInfo/selfRecord',
    method: 'put',
    data: data
  })
}

// 删除活动信息
export function delSelfRecord(activityId) {
  return request({
    url: '/activityInfo/selfRecord/' + activityId,
    method: 'delete'
  })
}

// 审核活动信息
export function processActivity(query) {
  return request({
    url: '/activityInfo/selfRecord/userSelfActivityApprove',
    method: 'get',
    params: query
  })
}