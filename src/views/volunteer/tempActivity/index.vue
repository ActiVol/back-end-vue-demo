<!-- 临时事件页面 -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="用户账号" prop="userName">
        <el-input style="width: 240px;" v-model="queryParams.userName" placeholder="请输入用户账号" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="内部邮箱" prop="internalEmail">
        <el-input style="width: 240px;" v-model="queryParams.internalEmail" placeholder="请输入内部邮箱" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="活动名称" prop="activityName">
        <el-input style="width: 240px;" v-model="queryParams.activityName" placeholder="请输入活动名称" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain :disabled="multiple" @click="handleDelete"
          v-hasPermi="['volunteer:tempActivity:remove']">
          <el-icon class="el-icon--right">
            <Delete />
          </el-icon>删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tempActivityList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column show-overflow-tooltip label="用户账号" align="center" prop="userName" min-width="120" />
      <el-table-column show-overflow-tooltip label="内部邮箱" align="center" prop="internalEmail" min-width="120" />
      <el-table-column show-overflow-tooltip label="外部邮箱" align="center" prop="externalEmail" min-width="120" />
      <el-table-column show-overflow-tooltip label="毕业年份" align="center" prop="graduationYear" min-width="120" />
      <el-table-column show-overflow-tooltip label="活动名称" align="center" prop="activityName" min-width="120" />
      <el-table-column show-overflow-tooltip label="活动地址" align="center" prop="activityAddress" min-width="120" />
      <el-table-column show-overflow-tooltip label="活动详情" align="center" prop="activityDetails" min-width="120" />
      <el-table-column show-overflow-tooltip label="开始时间" align="center" prop="activityStartTime" min-width="120">
        <template #default="scope">
          <span>{{
            parseTime(scope.row.activityStartTime, "{y}-{m}-{d}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="活动时长" align="center" prop="activityDuration" min-width="120" />
      <el-table-column show-overflow-tooltip label="举办者名称" align="center" prop="organizerName" min-width="120" />
      <el-table-column show-overflow-tooltip label="举办者邮件" align="center" prop="organizerEmail" min-width="120" />
      <el-table-column show-overflow-tooltip label="对管理员的留言" align="center" prop="commentToAdmin" min-width="120" />
      <el-table-column show-overflow-tooltip label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="temp_activity_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300" fixed="right">
        <template #default="scope">
          <el-button type="primary" text @click="processTempActivity(scope.row.id)"
            v-if="scope.row.reviewStatus === '1'" v-hasPermi="['volunteer:tempActivity:edit']">
            <el-icon class="el-icon--right">
              <Promotion />
            </el-icon>审核
          </el-button>

          <el-button type="primary" text @click="handleUpdate(scope.row)" v-if="scope.row.reviewStatus === '1'"
            v-hasPermi="['volunteer:tempActivity:edit']">
            <el-icon class="el-icon--right">
              <Edit />
            </el-icon>修改
          </el-button>

          <el-button type="primary" text @click="handleDelete(scope.row)" v-if="scope.row.reviewStatus === '1'"
            v-hasPermi="['volunteer:tempActivity:remove']">
            <el-icon class="el-icon--right">
              <Delete />
            </el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改临时活动对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="内部邮箱" prop="internalEmail">
          <el-input v-model="form.internalEmail" placeholder="请输入内部邮箱" />
        </el-form-item>
        <el-form-item label="外部邮箱" prop="externalEmail">
          <el-input v-model="form.externalEmail" placeholder="请输入内部邮箱" />
        </el-form-item>
        <el-form-item label="毕业年份" prop="graduationYear">
          <el-input v-model="form.graduationYear" placeholder="请输入毕业年份" />
        </el-form-item>
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动地址" prop="activityAddress">
          <el-input v-model="form.activityAddress" placeholder="请输入活动地址" />
        </el-form-item>
        <el-form-item label="活动详情" prop="activityDetails">
          <el-input v-model="form.activityDetails" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="开始时间" prop="activityStartTime">
          <el-date-picker clearable v-model="form.activityStartTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动时长" prop="activityDuration">
          <el-input v-model="form.activityDuration" placeholder="请输入活动时长" />
        </el-form-item>
        <el-form-item label="举办者名称" prop="organizerName">
          <el-input v-model="form.organizerName" placeholder="请输入举办者名称" />
        </el-form-item>
        <el-form-item label="举办者邮件" prop="organizerEmail">
          <el-input v-model="form.organizerEmail" placeholder="请输入举办者邮件" />
        </el-form-item>
        <el-form-item label="对管理员的留言" prop="commentToAdmin">
          <el-input v-model="form.commentToAdmin" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="状态" prop="reviewStatus">
          <el-radio-group v-model="form.reviewStatus">
            <el-radio v-for="dict in temp_activity_status" :key="dict.value" :label="dict.value">{{ dict.label }}
            </el-radio>
          </el-radio-group>
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

<script setup>
import {
  listTempActivity,
  getTempActivity,
  delTempActivity,
  addTempActivity,
  updateTempActivity,
  processTempActivity,
} from "@/api/volunteer/tempActivity";
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const { service_location, activity_status, service_field, service_object } =
  proxy.useDict(
    "service_location",
    "activity_status",
    "service_field",
    "service_object"
  );

// 定义响应式数据
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const tempActivityList = ref([]);
const title = ref("");
const open = ref(false);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: null,
  internalEmail: null,
  activityName: null,
});
const form = reactive({});
const rules = reactive({});

// 定义函数

// 获取活动列表
const getList = async () => {
  loading.value = true;
  const response = await listTempActivity(queryParams);
  tempActivityList.value = response.rows;
  total.value = response.total;
  loading.value = false;
};

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置查询
const resetQuery = () => {
  // 重置查询表单
  queryParams.userName = null;
  queryParams.internalEmail = null;
  queryParams.activityName = null;
  handleQuery();
};

// 添加临时活动
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加临时活动";
};

// 更新临时活动
const handleUpdate = async (row) => {
  reset();
  const id = row.id || ids.value;
  const response = await getTempActivity(id);
  Object.assign(form, response.data);
  open.value = true;
  title.value = "修改临时活动";
};

// 提交表单
const submitForm = () => {
  $refs.form.validate((valid) => {
    if (valid) {
      if (form.id != null) {
        updateTempActivity(form).then(() => {
          useModal().msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTempActivity(form).then(() => {
          useModal().msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

// 删除临时活动
const handleDelete = (row) => {
  const idsToDelete = row.id || ids.value;
  useModal()
    .confirm(`是否确认删除临时活动编号为"${idsToDelete}"的数据项？`)
    .then(() => {
      return delTempActivity(idsToDelete);
    })
    .then(() => {
      getList();
      useModal().msgSuccess("删除成功");
    })
    .catch(() => { });
};

// 导出临时活动
const handleExport = () => {
  download(
    "volunteer/tempActivity/export",
    { ...queryParams },
    `tempActivity_${new Date().getTime()}.xlsx`
  );
};

// 重置表单
const reset = () => {
  Object.assign(form, {
    id: null,
    userName: null,
    internalEmail: null,
    externalEmail: null,
    graduationYear: null,
    activityName: null,
    activityAddress: null,
    activityDetails: null,
    activityStartTime: null,
    activityDuration: null,
    organizerName: null,
    organizerEmail: null,
    commentToAdmin: null,
    reviewStatus: null,
  });
  // resetForm("form")  // 如果你有表单重置的方法
};

// 初始化
onMounted(() => {
  getList();
});
</script>
