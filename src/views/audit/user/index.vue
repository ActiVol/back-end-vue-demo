<!-- 活动报名页面 -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="queryParams.activityName" placeholder="请输入活动名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核时间" prop="approvalTime">
        <el-date-picker clearable v-model="queryParams.approvalTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择审核时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userRoleList" border>
      <el-table-column label="活动名称" width="200" show-overflow-tooltip align="center" prop="activityName" />
      <el-table-column label="活动地址" show-overflow-tooltip align="center" prop="address" />
      <el-table-column label="用户名" align="center" prop="userName" width="180" />
      <el-table-column label="活动时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动图片" align="center" prop="activityPictures" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.activityPictures" :width="50" :height="50" />
        </template>
      </el-table-column>



      <el-table-column width="150" label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleApproval(scope.row)">审核</el-button>
          <!-- v-hasPermi="['audit:activity:user']" -->
        </template>
      </el-table-column>





    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改用户角色审核对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="userRoleRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="用户名" prop="userName">
          <!-- {{ form.userId }} -->
          <el-input disabled v-model="form.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input disabled v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="报名状态" prop="approvalStatus">
          <el-radio-group v-model="form.approvalStatus">
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">拒绝</el-radio>
            <el-radio label="3">取消</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="审核理由" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入审核理由" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <!-- <el-button @click="cancel">取 消</el-button> -->
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AuditCenter">
import {
  getUser
} from "@/api/system/user";
import { getActivityDetail, approval, signUpPassApi, signUpRejectApi, signUpCancelApi } from "@/api/volunteer/audit";
import { listInfo } from "@/api/volunteer/info";

const { proxy } = getCurrentInstance();

const userRoleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("活动审核");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    approvalStatus: null,
    approvalTime: null,
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户角色审核列表 */
function getList() {
  loading.value = true;
  listInfo(queryParams.value).then((response) => {
    userRoleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    roleId: null,
    userName: null,
    activityName: null,
    approvalStatus: null,
    approvalTime: null,
    approvedBy: null,
    approvedUserId: null,
    reason: null,
  };
  proxy.resetForm("userRoleRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 修改按钮操作 */
function handleApproval(row) {
  reset();
  const _id = row.activityId;
  getUser(row.userId).then(res2 => {
    if (res2.code == 200) {
      console.log(111111111, res2.data)
      getActivityDetail(_id).then((response) => {
        form.value = response.data;
        form.value.approvalStatus = "1";
        form.value.reason = "";
        form.value.userId = res2.data.userId;
        form.value.userName = res2.data.userName;
        open.value = true;
      });
    }

  })

}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRoleRef"].validate((valid) => {
    if (valid) {
      // const reviewStatus = data.form.approvalStatus;
      // const reviewComments = data.form.reason;
      const activityId = data.form.activityId;
      const userId = data.form.userId;

      // 通过
      if (data.form.approvalStatus == 1) {
        signUpPassApi({
          activityId, //活动ID
          userId, // 用户ID
        }).then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess("审核成功");
            open.value = false;
            getList();
          }
        });
      }
      // 拒绝
      else if (data.form.approvalStatus == 2) {
        signUpRejectApi({
          activityId, //活动ID
          userId, // 用户ID
        }).then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess("审核成功");
            open.value = false;
            getList();
          }
        });
      }
      // 取消
      else if (data.form.approvalStatus == 3) {
        signUpCancelApi({
          activityId, //活动ID
          userId, // 用户ID
        }).then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess("审核成功");
            open.value = false;
            getList();
          }
        });
      }


      // approval({ reviewStatus, reviewComments }, id).then((response) => {
      //   proxy.$modal.msgSuccess("审核成功");
      //   open.value = false;
      //   getList();
      // });
    }
  });
}

getList();
</script>
