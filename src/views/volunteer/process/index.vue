<!-- 审计信息页面 -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="活动名称" prop="activityName">
        <el-input style="width: 240px;" v-model="queryParams.activityName" placeholder="请输入活动名称" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="活动地址" prop="address">
        <el-input style="width: 240px;" v-model="queryParams.address" placeholder="请输入活动地址" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="服务领域" prop="serviceField">
        <el-select style="width: 240px;" v-model="queryParams.serviceField" placeholder="请选择服务领域" clearable>
          <el-option v-for="dict in service_field" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务对象" prop="serviceObject">
        <el-select v-model="queryParams.serviceObject" placeholder="请选择服务对象" style="width: 240px;" clearable>
          <el-option v-for="dict in service_object" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务场所" prop="serviceLocation">
        <el-select v-model="queryParams.serviceLocation" placeholder="请选择服务场所" style="width: 240px;" clearable>
          <el-option v-for="dict in service_location" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="infoList" border>
      <el-table-column label="活动名称" width="200" show-overflow-tooltip align="center" prop="activityName" />
      <el-table-column label="活动地址" show-overflow-tooltip align="center" prop="address" />
      <el-table-column show-overflow-tooltip label="活动时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="活动图片" align="center" prop="activityPictures" width="120">
        <template #default="scope">
          <image-preview :src="scope.row.activityPictures" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务领域" align="center" prop="serviceField" min-width="200">
        <template #default="scope">
          <dict-tag :options="service_field" :value="scope.row.serviceField" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务对象" align="center" prop="serviceObject" min-width="150">
        <template #default="scope">
          <dict-tag :options="service_object" :value="scope.row.serviceObject" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务场所" align="center" prop="serviceLocation" min-width="200">
        <template #default="scope">
          <dict-tag :options="service_location" :value="scope.row.serviceLocation" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="发布状态" align="center" prop="publishStatus" min-width="150">
        <template #default="scope">
          <dict-tag :options="publish_status" :value="scope.row.publishStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="text" icon="el-icon-s-check" @click="handleProcess(scope.row)"
            v-hasPermi="['volunteer:info:edit']" v-if="scope.row.publishStatus == 2">审核</el-button>
          <!-- {{scope.row.publishStatus}} -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改活动信息对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="活动名称">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" readonly />
        </el-form-item>
        <el-form-item label="活动地址">
          <el-input v-model="form.address" placeholder="请输入活动地址" readonly />
        </el-form-item>
        <el-form-item label="活动详情">
          <el-input v-model="form.details" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="服务领域">
          <el-select v-model="form.serviceField" placeholder="请选择服务领域" style="width: 100%;">
            <el-option v-for="dict in service_field" :key="dict.value" :label="dict.label" :value="dict.value"
              disabled></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务对象">
          <el-select v-model="form.serviceObject" placeholder="请选择服务对象" style="width: 100%;">
            <el-option v-for="dict in service_object" :key="dict.value" :label="dict.label" :value="dict.value"
              disabled></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务场所">
          <el-select v-model="form.serviceLocation" placeholder="请选择服务场所" style="width: 100%;">
            <el-option v-for="dict in service_location" :key="dict.value" :label="dict.label" :value="dict.value"
              disabled></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker clearable v-model="form.startTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择开始时间"
            style="width: 100%;" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker clearable v-model="form.endTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择结束时间"
            style="width: 100%;" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审核状态" prop="reviewStatus">
          <el-radio-group v-model="form.reviewStatus">
            <el-radio v-for="dict in review_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="form.reviewComments" type="textarea" />
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
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { processListInfo, getInfo } from '@/api/volunteer/info';
import { processActivity } from "@/api/volunteer/process";
const { proxy } = getCurrentInstance();
const { service_location, activity_status, service_field, service_object } = proxy.useDict('service_location', 'activity_status', 'service_field', 'service_object');

// 定义响应式数据
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const infoList = ref([]);
const title = ref('');
const open = ref(false);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  activityName: null,
  address: null,
  serviceField: null,
  serviceObject: null,
  serviceLocation: null
});

// 表单数据
const form = reactive({
  activityId: null,
  activityName: null,
  address: null,
  details: null,
  serviceField: null,
  serviceObject: null,
  serviceLocation: null,
  startTime: null,
  endTime: null,
  reviewStatus: '1',
  reviewComments: null
});

// 审核规则
const rules = {
  reviewStatus: [
    { required: true, message: '请选择审核状态', trigger: 'change' }
  ]
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  const response = await processListInfo(queryParams);
  infoList.value = response.rows;
  total.value = response.total;
  loading.value = false;
};

// 处理审核
const handleProcess = async (row) => {
  reset();
  const activityId = row.activityId;
  const response = await getInfo(activityId);
  const { activityId: id, activityName, address, details, serviceField, serviceObject, serviceLocation, startTime, endTime } = response.data;
  form.activityId = id;
  form.activityName = activityName;
  form.address = address;
  form.details = details;
  form.serviceField = serviceField;
  form.serviceObject = serviceObject;
  form.serviceLocation = serviceLocation;
  form.startTime = startTime;
  form.endTime = endTime;
  open.value = true;
  title.value = '审核发布活动';
};

// 取消审核
const cancel = () => {
  open.value = false;
  reset();
};

// 重置表单
const reset = () => {
  Object.assign(form, {
    activityId: null,
    activityName: null,
    address: null,
    recruitNumber: null,
    details: null,
    activityPictures: null,
    serviceField: null,
    serviceObject: null,
    serviceLocation: null,
    startTime: null,
    endTime: null,
    reviewStatus: null,
    reviewComments: null
  });
};

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置查询
const resetQuery = () => {
  queryParams.activityName = null;
  queryParams.address = null;
  queryParams.serviceField = null;
  queryParams.serviceObject = null;
  queryParams.serviceLocation = null;
  handleQuery();
};

// 提交审核表单
const submitForm = () => {
  const { activityId, reviewStatus, reviewComments } = form;
  const param = { activityId, reviewStatus, reviewComments };
  processActivity(param).then(() => {
    // 弹出提示
    $modal.msgSuccess('审核成功');
    open.value = false;
    getList();
  });
};

// 生命周期钩子：组件创建时获取列表
onMounted(() => {
  getList();
});
</script>
