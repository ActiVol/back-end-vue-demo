<!-- 活动信息页面 -->
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
        <el-select v-model="queryParams.serviceObject" placeholder="请选择服务对象" clearable style="width: 240px;">
          <el-option v-for="dict in service_object" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务场所" prop="serviceLocation">
        <el-select v-model="queryParams.serviceLocation" placeholder="请选择服务场所" clearable style="width: 240px;">
          <el-option v-for="dict in service_location" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['volunteer:info:add']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动名称" width="200" show-overflow-tooltip align="center" prop="activityName" />
      <el-table-column label="活动地址" show-overflow-tooltip align="center" prop="address" width="200" />
      <el-table-column show-overflow-tooltip label="活动时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动时长" align="center" prop="duration" width="100" />
      <el-table-column label="招募人数" align="center" prop="recruitNumber" width="100" />
      <el-table-column label="活动详情" show-overflow-tooltip align="center" prop="details" width="250" />
      <el-table-column show-overflow-tooltip label="活动图片" align="center" prop="activityPictures" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.activityPictures" :width="50" :height="50" style="margin-top: 5px;" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务领域" align="center" prop="serviceField" width="250">
        <template #default="scope">
          <dict-tag :options="service_field" :value="scope.row.serviceField" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务对象" align="center" prop="serviceObject" width="200">
        <template #default="scope">
          <dict-tag :options="service_object" :value="scope.row.serviceObject" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="服务场所" align="center" prop="serviceLocation" width="200">
        <template #default="scope">
          <dict-tag :options="service_location" :value="scope.row.serviceLocation" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="活动状态" align="center" prop="activityStatus" width="200">
        <template #default="scope">
          <dict-tag :options="activity_status" :value="scope.row.activityStatus" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="操作" align="center" class-name="small-padding fixed-width"
        fixed="right" width="350">
        <template #default="scope">





          <el-button type="text" icon="Position" @click="handlePublish(scope.row)" v-hasPermi="['volunteer:info:edit']"
            v-if="
              scope.row.activityStatus == 3 || scope.row.activityStatus == 4
            ">发布</el-button>
          <!-- 活动结束 -->
          <el-button v-if="scope.row.activityStatus == 3" link type="primary"
            @click="handleActivity(scope.row.activityId)" v-hasPermi="['audit:activity:list']">
            <el-icon>
              <SwitchButton />
            </el-icon> 结束
          </el-button>
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['volunteer:info:edit']">修改</el-button>
          <el-button type="text" icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['volunteer:info:remove']"
            v-if="scope.row.activityStatus == 3">删除</el-button>
        </template>




      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改活动信息对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入活动地址" />
        </el-form-item>
        <el-form-item label="招募人数" prop="recruitNumber">
          <el-input v-model="form.recruitNumber" placeholder="请输入招募人数" />
        </el-form-item>
        <el-form-item label="活动详情" prop="details">
          <el-input v-model="form.details" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="活动图片">
          <image-upload ref="imageUpload" v-model="form.activityPictures" :limit="1" />
        </el-form-item>
        <el-form-item label="服务领域" prop="serviceField">
          <el-select v-model="form.serviceField" placeholder="请选择服务领域" style="width: 100%">
            <el-option v-for="dict in service_field" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务对象" prop="serviceObject">
          <el-select v-model="form.serviceObject" placeholder="请选择服务对象" style="width: 100%">
            <el-option v-for="dict in service_object" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务场所" prop="serviceLocation">
          <el-select v-model="form.serviceLocation" placeholder="请选择服务场所" style="width: 100%">
            <el-option v-for="dict in service_location" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <!-- {{ form.startTime }} -->
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动时长">
          <el-input v-model="form.duration" placeholder="请输入活动时长" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 活动详情对话框 -->
    <el-dialog title="活动详情" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动ID">{{
          detailData.activityId
        }}</el-descriptions-item>
        <el-descriptions-item label="活动名称">{{
          detailData.activityName
        }}</el-descriptions-item>
        <el-descriptions-item label="活动地址" :span="2">{{
          detailData.address
        }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{
          parseTime(detailData.startTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{
          parseTime(detailData.endTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="活动时长">{{
          detailData.duration
        }}</el-descriptions-item>
        <el-descriptions-item label="招募人数">{{
          detailData.recruitNumber
        }}</el-descriptions-item>
        <el-descriptions-item label="服务领域">
          <dict-tag :options="service_field" :value="detailData.serviceField" />
        </el-descriptions-item>
        <el-descriptions-item label="服务对象">
          <dict-tag :options="service_object" :value="detailData.serviceObject" />
        </el-descriptions-item>
        <el-descriptions-item label="服务场所">
          <dict-tag :options="service_location" :value="detailData.serviceLocation" />
        </el-descriptions-item>
        <el-descriptions-item label="活动状态">
          <dict-tag :options="activity_status" :value="detailData.activityStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="活动详情" :span="2">{{
          detailData.details
        }}</el-descriptions-item>
        <el-descriptions-item label="活动图片" :span="2">
          <image-preview v-if="detailData.activityPictures" :src="detailData.activityPictures" :width="200"
            :height="200" />
          <span v-else>暂无图片</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" style="margin-top: 20px;">
        <!-- 审核记录Tab -->
        <el-tab-pane label="审核记录" name="reviewLog">
          <el-table :data="detailData.reviewLog || []" style="width: 100%;max-height: 500px;" border>
            <el-table-column label="审核人" align="center" prop="reviewer" width="150" />
            <el-table-column label="状态" align="center" prop="reviewStatus" width="120">
              <template #default="scope">
                <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
              </template>
            </el-table-column>
            <el-table-column label="审核意见" align="center" prop="reviewComments" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ scope.row.reviewComments || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="审核时间" align="center" prop="reviewTime" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.reviewTime) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 报名用户Tab -->
        <el-tab-pane label="报名用户" name="signUpUsers">
          <el-table :data="detailData.signUpUsers || []" style="width: 100%;max-height: 500px;" border>
            <el-table-column label="审核人" align="center" prop="reviewer">
              <template #default="scope">
                <span>{{ scope.row.reviewer || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="报名状态" align="center" prop="participationStatus">
              <template #default="scope">
                <!-- <span>{{ scope.row.participationStatus || '-' }}</span> -->
                <dict-tag :options="review_status" :value="scope.row.participationStatus" />
              </template>
            </el-table-column>
            <el-table-column label="审核时间" align="center" prop="reviewTime" width="180">
              <template #default="scope">
                <span>{{ scope.row.reviewTime ? parseTime(scope.row.reviewTime) : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="报名时间" align="center" prop="signupTime" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.signupTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="报名人" align="center" prop="userName">
              <template #default="scope">
                <span>{{ scope.row.userName || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import {
  activityEndApi
} from "@/api/volunteer/audit";
import {
  listInfo2,
  getInfo,
  delInfo,
  addInfo,
  updateInfo,
  publishInfo,
} from "@/api/volunteer/info";
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const { service_location, activity_status, service_field, service_object } =
  proxy.useDict(
    "service_location",
    "activity_status",
    "service_field",
    "service_object"
  );
console.log(service_location);
// 定义响应式数据
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const infoList = ref([]);
const title = ref("");
const open = ref(false);
// 添加详情相关的响应式变量
const detailOpen = ref(false);
const detailData = ref({});
// 添加Tab相关变量
const activeTab = ref("reviewLog");

const data = reactive({
  form: {
    activityId: undefined,
    activityName: undefined,
    address: undefined,
    recruitNumber: undefined,
    details: undefined,
    activityPictures: undefined,
    serviceField: undefined,
    serviceObject: undefined,
    serviceLocation: undefined,
    startTime: null,
    endTime: null,
    duration: null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityName: null,
    address: null,
    serviceField: null,
    serviceObject: null,
    serviceLocation: null,
  },
  rules: {
    activityName: [
      { required: true, message: "活动名称不能为空", trigger: "blur" },
    ],
    address: [{ required: true, message: "活动地址不能为空", trigger: "blur" }],
    recruitNumber: [
      { required: true, message: "招募人数不能为空", trigger: "blur" },
    ],
    details: [{ required: true, message: "活动详情不能为空", trigger: "blur" }],
    serviceField: [
      { required: true, message: "服务领域不能为空", trigger: "change" },
    ],
    serviceObject: [
      { required: true, message: "服务对象不能为空", trigger: "change" },
    ],
    serviceLocation: [
      { required: true, message: "服务场所不能为空", trigger: "change" },
    ],
    startTime: [
      { required: true, message: "开始时间不能为空", trigger: "change" },
    ],
    endTime: [
      { required: true, message: "结束时间不能为空", trigger: "change" },
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);
// 创建时获取列表数据
onMounted(() => {
  getList();
});

// 获取活动信息列表
const getList = () => {
  loading.value = true;
  listInfo2(queryParams.value).then((response) => {
    infoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};

// 取消操作
const cancel = () => {
  open.value = false;
  reset();
};

// 查看详情 
const handleView = async (row) => {
  try {
    loading.value = true;
    const response = await getInfo(row.activityId);
    detailData.value = response.data;

    // 如果接口没有返回审核记录和报名用户，可以在这里初始化空数组
    if (!detailData.value.reviewLog) {
      detailData.value.reviewLog = [];
    }
    if (!detailData.value.signUpUsers) {
      detailData.value.signUpUsers = [];
    }

    detailOpen.value = true;
  } catch (error) {
    proxy.$modal.msgError("获取详情失败");
    console.error("获取详情失败:", error);
  } finally {
    loading.value = false;
  }
};

// 活动结束
function handleActivity(id) {
  proxy.$confirm('确定要结束该活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    activityEndApi(id).then(res => {
      console.log("结束活动", res)
      if (res.code == 200) {
        proxy.$message.success('活动已结束')
        console.log("活动结束", res)
        // 这里可以添加其他成功后的逻辑，如刷新列表等
      }
    })
  }).catch(() => {
  })
}

// 重置表单
const reset = () => {
  form.value = {
    activityId: undefined,
    activityName: undefined,
    address: undefined,
    recruitNumber: undefined,
    details: undefined,
    activityPictures: undefined,
    serviceField: undefined,
    serviceObject: undefined,
    serviceLocation: undefined,
    startTime: null,
    endTime: null,
    duration: null,
  };
  proxy.resetForm("formRef");
};

// 查询处理
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置查询条件
const resetQuery = () => {
  proxy.resetForm("queryForm");
  handleQuery();
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.activityId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 添加活动
const handleAdd = () => {
  reset();
  console.log(form.value);
  open.value = true;
  title.value = "添加活动信息";
};

// 更新活动
const handleUpdate = (row) => {
  reset();
  const activityId = row.activityId || ids.value;
  getInfo(activityId).then((response) => {
    form.value = { ...response.data };
    open.value = true;
    title.value = "修改活动信息";
  });
};

// 提交表单
const submitForm = () => {
  const fileArray = proxy.$refs.imageUpload.fileArray;
  const fileId = fileArray && fileArray.length ? fileArray[0].fileId : "";
  form.value.fileId = fileId;

  if (form.value.activityId != null) {
    updateInfo(form.value).then(() => {
      proxy.$modal.msgSuccess("修改成功");
      open.value = false;
      getList();
    });
  } else {
    addInfo(form.value).then(() => {
      proxy.$modal.msgSuccess("新增成功");
      open.value = false;
      getList();
    });
  }
};

// 删除活动
const handleDelete = (row) => {
  const activityIds = row.activityId || ids.value;
  proxy.$modal
    .confirm(`是否确认删除活动信息编号为"${activityIds}"的数据项？`)
    .then(() => {
      return delInfo(activityIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => { });
};

// 用于发布活动
const handlePublish = (data) => {
  const { activityId } = data;
  publishInfo(activityId).then(() => {
    getList();
    proxy.$modal.msgSuccess("发布成功");
  });
};
</script>
