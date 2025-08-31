<!-- 用户角色审核页面 -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="用户名" prop="userName">
        <el-input style="width: 240px;" v-model="queryParams.userName" placeholder="请输入用户名" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-select style="width: 240px;" v-model="queryParams.approvalStatus" placeholder="请选择审核状态" clearable>
          <el-option v-for="dict in user_role_approval_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核时间" prop="approvalTime">
        <el-date-picker style="width: 240px;" clearable v-model="queryParams.approvalTime" type="date"
          value-format="YYYY-MM-DD" placeholder="请选择审核时间">
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

    <el-table v-loading="loading" :data="userRoleList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column show-overflow-tooltip label="用户名" align="center" prop="userName" />
      <el-table-column show-overflow-tooltip label="角色名称" align="center" prop="ruleName" />
      <el-table-column show-overflow-tooltip label="审核状态" align="center" prop="approvalStatus">
        <template #default="scope">
          <dict-tag :options="user_role_approval_status" :value="scope.row.approvalStatus" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="审核时间" align="center" prop="approvalTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.approvalTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="审核理由" align="center" prop="reason" />
      <el-table-column width="150" label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleApproval(scope.row)"
            v-hasPermi="['volunteer:userRole:approval']">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改用户角色审核对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="userRoleRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="审核状态" prop="approvalStatus">
          <el-radio-group v-model="form.approvalStatus">
            <el-radio label="1">同意</el-radio>
            <el-radio label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核理由" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入审核理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserRole">
import { listUserRole, getUserRole, approval } from "@/api/volunteer/userRole";

const { proxy } = getCurrentInstance();
const { user_role_approval_status } = proxy.useDict('user_role_approval_status');

const userRoleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    approvalStatus: null,
    approvalTime: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户角色审核列表 */
function getList() {
  loading.value = true;
  listUserRole(queryParams.value).then(response => {
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
    ruleName: null,
    approvalStatus: null,
    approvalTime: null,
    approvedBy: null,
    approvedUserId: null,
    reason: null
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


/** 修改按钮操作 */
function handleApproval(row) {
  reset();
  const _id = row.id || ids.value
  getUserRole(_id).then(response => {
    form.value = response.data;
    form.value.approvalStatus = '1';
    form.value.reason = '同意';
    open.value = true;
    title.value = "审核角色信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRoleRef"].validate(valid => {
    if (valid) {
      approval(form.value).then(response => {
        proxy.$modal.msgSuccess("审核成功");
        open.value = false;
        getList();
      });

    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除用户角色审核编号为"' + _ids + '"的数据项？').then(function () {
    return delUserRole(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('volunteer/userRole/export', {
    ...queryParams.value
  }, `userRole_${new Date().getTime()}.xlsx`)
}

getList();
</script>
