<!-- 活动申请页面 -->
<template>
  <div class="app-container">
    <!-- 搜索表单和表格部分保持不变 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="活动名称" prop="activityName">
        <el-input style="width: 240;" v-model="queryParams.activityName" placeholder="请输入活动名称" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="活动状态" prop="activityStatus">
        <!-- clearable -->
        <el-select v-model="queryParams.activityStatus" placeholder="请选择活动状态" style="width: 240px">
          <el-option v-for="dict in activityStatusList" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
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
      <el-table-column show-overflow-tooltip label="活动名称" align="center" prop="activityName" />
      <el-table-column show-overflow-tooltip label="活动地址" align="center" prop="address" />
      <el-table-column show-overflow-tooltip label="活动详情" align="center" prop="details" />
      <el-table-column show-overflow-tooltip label="活动人数" align="center" prop="recruitNumber" />
      <el-table-column show-overflow-tooltip label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleApproval(scope.row)" v-hasPermi="['audit:activity:list']"
            icon="View">
            详情
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 优化后的活动详情对话框 -->
    <el-dialog title="活动详情" v-model="open" width="700px" class="scrollbar" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动ID">{{
          form.activityId || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="活动名称">{{
          form.activityName || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="活动地址" :span="2">{{
          form.address || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{
          parseTime(form.startTime) || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{
          parseTime(form.endTime) || "--"
          }}</el-descriptions-item>
        <el-descriptions-item label="活动时长">{{
          form.duration || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="招募人数">{{
          form.recruitNumber || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">
          <dict-tag :options="activityStatusList" :value="form.activityStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="活动详情" :span="2">{{
          form.details || "--"
        }}</el-descriptions-item>
        <el-descriptions-item label="活动图片" :span="2">
          <image-preview v-if="form.activityPictures" :src="form.activityPictures" :width="200" :height="200" />
          <span v-else>暂无图片</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-section" style="margin-top: 20px">
        <div class="left-area">
          <el-button type="primary" @click="toggleTableData"
            :icon="currentTable === 'reviewLog' ? 'Tickets' : 'Document'" class="toggle-btn">
            切换到{{
              currentTable === "reviewLog" ? "已报名用户列表" : "审核记录列表"
            }}
          </el-button>
        </div>
        <div class="right-area">
          <!-- 根据活动状态显示不同按钮 -->
          <el-button v-if="form.activityStatus === '1'" type="primary" @click="handleSubmit"
            v-hasPermi="['audit:activity:submit']">
            提交
          </el-button>

          <el-button v-if="form.activityStatus === '2'" type="success" @click="showApprovalForm"
            v-hasPermi="['audit:activity:approve']">
            审核
          </el-button>
          <!-- 当状态为已完成(3)时不显示按钮 -->
        </div>
      </div>

      <!-- 表格展示区域 -->
      <div class="bottom-section" style="margin-top: 20px">
        <!-- 审核日志表格 -->
        <el-table v-if="currentTable === 'reviewLog'" :data="detailData.reviewLog" border style="width: 100%"
          class="detail-table" max-height="500">
          <el-table-column prop="reviewer" label="操作人" align="center" />
          <el-table-column prop="reviewStatus" label="状态" align="center">
            <template #default="scope">
              <!-- <el-tag :type="scope.row.reviewStatus === '1' ? 'success' : 'danger'">
                {{ scope.row.reviewStatus === "1" ? "同意" : "驳回" }}
              </el-tag> -->
              <!-- --------------------- -->
              <dict-tag :options="activity_status" :value="scope.row.reviewStatus" />
            </template>
          </el-table-column>
          <el-table-column prop="reviewComments" label="审批意见" align="center">
            <template #default="scope">
              <span v-if="scope.row.reviewComments">{{
                scope.row.reviewComments
              }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="reviewTime" label="审批时间" align="center" width="180">
            <template #default="scope">
              <span>{{
                parseTime(scope.row.reviewTime, "{y}-{m}-{d} {h}:{i}:{s}")
              }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 报名用户表格 -->
        <el-table v-else :data="detailData.signUpUsers" border style="width: 100%" class="detail-table">
          <el-table-column prop="userName" label="报名用户" align="center" />
          <el-table-column prop="signupTime" label="报名时间" align="center" width="180">
            <template #default="scope">
              <span>{{
                parseTime(scope.row.signupTime, "{y}-{m}-{d} {h}:{i}:{s}")
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="participationStatus" label="参与状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.participationStatus === 1">待审核</el-tag>
              <el-tag v-else-if="scope.row.participationStatus === 2" type="success">已通过</el-tag>
              <el-tag v-else-if="scope.row.participationStatus === 3" type="danger">未通过</el-tag>
              <el-tag v-else-if="scope.row.participationStatus === 4" type="warning">已取消</el-tag>
              <span v-else>{{ scope.row.participationStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审核信息" align="center">
            <template #default="scope">
              <div v-if="scope.row.reviewOrganizer || scope.row.reviewAdmin">
                <div v-if="scope.row.reviewOrganizer">
                  组织者: {{ scope.row.reviewOrganizer }}
                </div>
                <div v-if="scope.row.reviewAdmin">
                  管理员: {{ scope.row.reviewAdmin }}
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog :title="approvalTitle" v-model="approvalOpen" width="800px" append-to-body>
      <el-form ref="approvalFormRef" :model="approvalForm" :rules="approvalRules" label-width="auto">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="approvalForm.activityName" disabled />
        </el-form-item>
        <el-form-item label="审核状态" prop="approvalStatus">
          <el-radio-group v-model="approvalForm.approvalStatus">
            <el-radio label="1">同意</el-radio>
            <el-radio label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核理由" prop="reason">
          <el-input v-model="approvalForm.reason" type="textarea" placeholder="请输入审核理由" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval">确 定</el-button>
          <el-button @click="cancelApproval">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 提交弹窗 -->
    <el-dialog title="活动提交" v-model="approvalOpen2" width="800px" append-to-body>
      <el-form ref="approvalFormRef2" :model="approvalForm2" :rules="approvalRules2" label-width="auto">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="approvalForm2.activityName" disabled />
        </el-form-item>
        <el-form-item label="备注" prop="reviewComments">
          <el-input v-model="approvalForm2.reviewComments" type="textarea" placeholder="请输入备注" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval2">确 定</el-button>
          <el-button @click="approvalOpen2 = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AuditCenter">

import {
  getUserRecordList,
  getActivityDetail,
  approval,
  activityEndApi,
  submitAuditApi
} from "@/api/volunteer/audit";

const { proxy } = getCurrentInstance();

const userRoleList = ref([]);
const open = ref(false);
const approvalOpen = ref(false);
const approvalOpen2 = ref(false);
const approvalTitle = ref("活动审核");
const approvalFormRef = ref(null);
const approvalFormRef2 = ref(null);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");
const activityStatusList = ref([
  { value: "1", label: "待提交" },
  { value: "2", label: "待审核" },
  { value: "3", label: "已完成" },
]);
const { activity_status } = proxy.useDict("activity_status");

const detailData = ref({
  reviewLog: [],
  signUpUsers: [],
});

const currentTable = ref("reviewLog");

// 审核表单数据
const approvalForm = ref({
  activityId: null,
  activityName: "",
  approvalStatus: "1",
  reason: "",
});

// 提交表单数据
const approvalForm2 = ref({
  activityName: null,
  reason: ""
});

// 审核表单验证规则
const approvalRules = ref({
  reason: [{ required: true, message: "审核理由不能为空", trigger: "blur" }],
});

const approvalRules2 = ref({
  reviewComments: [{ required: true, message: "活动名称不能为空", trigger: "blur" }],
  reason: [{ required: true, message: "备注不能为空", trigger: "blur" }],
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    approvalStatus: null,
    activityStatus: "2", // 默认显示待审核状态
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户角色审核列表 */
function getList() {
  loading.value = true;
  getUserRecordList(queryParams.value).then((response) => {
    userRoleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 切换表格数据
function toggleTableData() {
  currentTable.value =
    currentTable.value === "reviewLog" ? "signUpUsers" : "reviewLog";
}

// 添加提交方法
function handleSubmit() {
  console.log(6666, form.value);

  // proxy.$modal.msgWarning("提交功能待实现");
  // 这里可以根据实际需求添加提交逻辑
  // 例如调用提交API接口
  // submitAuditApi().then(res => {
  //   if (res.code == 200) {
  //     console.log(66666, res);
  //     proxy.$modal.msgWarning("提交成功");
  //   }
  // })
  approvalForm2.value = {
    // activityName: approvalForm.value.activityName,
    activityId: form.value.activityId,
    activityName: form.value.activityName,
    reason: form.value.reason
  };
  approvalOpen2.value = true;
}

// 显示审核表单
function showApprovalForm() {
  approvalForm.value = {
    activityId: form.value.activityId,
    activityName: form.value.activityName,
    approvalStatus: "1",
    reason: "",
  };
  approvalOpen.value = true;
}

// 取消审核
function cancelApproval() {
  approvalOpen.value = false;
  proxy.resetForm("approvalFormRef");
}

// 提交审核
function submitApproval() {
  proxy.$refs["approvalFormRef"].validate((valid) => {
    if (valid) {
      const reviewStatus = approvalForm.value.approvalStatus;
      const reviewComments = approvalForm.value.reason;
      const id = approvalForm.value.activityId;

      approval({ reviewStatus, reviewComments }, id)
        .then((response) => {
          proxy.$modal.msgSuccess("审核成功");
          approvalOpen.value = false;
          open.value = false;
          getList();
        })
        .catch((error) => {
          console.error(error);
          proxy.$modal.msgError("审核失败");
        });
    }
  });
}

// 提交审核
function submitApproval2() {
  proxy.$refs["approvalFormRef2"].validate((valid) => {
    if (valid) {
      // const activityName = approvalForm2.value.activityName;
      const reviewComments = approvalForm2.value.reviewComments;
      const activityId = approvalForm2.value.activityId;

      submitAuditApi({ "reviewComments": reviewComments }, activityId)
        .then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess("提交成功");
            approvalOpen2.value = false;
            open.value = false;
            getList();
          }
        })
        .catch((error) => {
          console.error(error);
          proxy.$modal.msgError("提交失败");
        });
    }
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
    approvedBy: null,
    approvedUserId: null,
    reason: null,
    activityStatus: "2",
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

// 修改 handleApproval 方法，确保正确设置表单数据
function handleApproval(row) {
  reset();
  const _id = row.activityId;
  getActivityDetail(_id)
    .then((response) => {
      // 设置详情数据
      detailData.value = {
        reviewLog: response.data.reviewLog || [],
        signUpUsers: response.data.signUpUsers || [],
      };

      // 设置表单数据
      form.value = { ...response.data };
      form.value.approvalStatus = "1";
      form.value.reason = "";

      // 设置审核表单数据
      approvalForm.value.activityId = response.data.activityId;
      approvalForm.value.activityName = response.data.activityName;
      approvalForm.value.approvalStatus = "1";
      approvalForm.value.reason = "";

      // 重置表格显示状态
      currentTable.value = "reviewLog";

      open.value = true;
    })
    .catch((error) => {
      console.error(error);
      proxy.$modal.msgError("获取活动详情失败");
    });
}

getList();



</script>

<style lang="scss" scoped>
.action-section {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  margin-bottom: 15px;
}

.left-area,
.right-area {
  flex: 1;
  display: flex;
  align-items: center;
}

.left-area {
  justify-content: flex-start;
}

.right-area {
  justify-content: flex-end;
}

.bottom-section {
  flex: 1;
  overflow: auto;
  padding: 0 5px;
}

.detail-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.bottom-section :deep(.el-table) {
  margin-bottom: 10px;
}

.bottom-section :deep(.el-table th) {
  background-color: #f5f7fa;
}

/* 状态标签样式优化 */
.status-tag {
  font-weight: bold;
}

/* 切换按钮样式优化 */
.toggle-btn {
  transition: all 0.3s;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dialog-footer {
  padding: 10px 20px 20px;
  text-align: right;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-section {
    flex-direction: column;
    gap: 10px;
  }

  .left-area,
  .right-area {
    width: 100%;
    justify-content: center;
  }
}
</style>
