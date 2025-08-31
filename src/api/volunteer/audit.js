import request from '@/utils/request'

// 查询活动人员详情
export function getActivityDetail(id) {
  return request({
    url: "/volunteer/info/" + id,
    method: "get",
  });
}

// 查询用户角色审核列表
export function getUserRecordList(query) {
  return request({
    url: "/volunteer/info/getAuditActivityList",
    method: "get",
    params: query,
  });
}

// 修改用户角色审核
export function approval(data, activityId) {
  return request({
    url: '/volunteer/info/process/' + activityId,
    method: 'put',
    params: data
  })
}

// 用户报名通过
export function signUpPassApi(data) {
  return request({
    url: '/volunteer/userRecord/signUpPass',
    method: 'put',
    params: data
  })
}

// 用户报名拒绝
export function signUpRejectApi(data) {
  return request({
    url: '/volunteer/userRecord/signUpReject',
    method: 'put',
    params: data
  })
}

// 用户报名取消
export function signUpCancelApi(data) {
  return request({
    url: '/volunteer/userRecord/signUpCancel',
    method: 'put',
    params: data
  })
}


// 活动结束
export function activityEndApi(id) {
  return request({
    url: '/volunteer/info/over/' + id,
    method: 'put'
  })
}

// 提交审核
export function submitAuditApi(data, id) {
  return request({
    url: '/volunteer/info/commit/' + id,
    method: 'put',
    params: data
  })
}