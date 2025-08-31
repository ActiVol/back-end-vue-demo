<!-- 用户上报活动审批页面 -->
<template>
    <!-- {{ activity_status }} -->
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
            <el-form-item label="活动名称" prop="activityName">
                <el-input v-model="queryParams.activityName" placeholder="请输入活动名称" clearable @keyup.enter="handleQuery"
                    :style="{ width: '240px' }" />
            </el-form-item>
            <el-form-item label="开始时间" prop="startTime">
                <el-date-picker clearable v-model="queryParams.startTime" type="date" value-format="YYYY-MM-DD"
                    placeholder="请选择开始时间" :style="{ width: '240px' }" />
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
                <el-date-picker clearable v-model="queryParams.endTime" type="date" value-format="YYYY-MM-DD"
                    placeholder="请选择结束时间" :style="{ width: '240px' }" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="selfRecordList" @selection-change="handleSelectionChange" border>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="活动名称" align="center" prop="activityName" show-overflow-tooltip min-width="200" />
            <el-table-column label="审核状态" align="center" prop="approveStatus" show-overflow-tooltip min-width="120">
                <template #default="scope">
                    <el-tag :type="getTagType(scope.row.approveStatus)">
                        {{ getLabel(scope.row.approveStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <!-- 申请人 -->
            <el-table-column label="申请人" align="center" prop="createName" show-overflow-tooltip min-width="120" />
            <!-- 申请时间 -->
            <el-table-column label="申请时间" align="center" prop="createTime" width="180"></el-table-column>
            <el-table-column label="活动时长" align="center" prop="duration" show-overflow-tooltip min-width="120" />
            <el-table-column label="招募人数" align="center" prop="recruitNumber" show-overflow-tooltip min-width="120" />
            <el-table-column label="活动地址" align="center" prop="address" show-overflow-tooltip min-width="120" />
            <el-table-column label="服务领域" align="center" prop="serviceField" show-overflow-tooltip min-width="120" />
            <el-table-column label="服务对象" align="center" prop="serviceObject" show-overflow-tooltip min-width="120" />
            <el-table-column label="服务场所" align="center" prop="serviceLocation" show-overflow-tooltip min-width="120" />
            <el-table-column label="举办者姓名" align="center" prop="organizerName" min-width="120" show-overflow-tooltip />
            <el-table-column label="举办者邮箱" align="center" prop="organizerEmail" min-width="120" show-overflow-tooltip />
            <el-table-column label="活动详情" align="center" prop="details" show-overflow-tooltip min-width="120" />
            <el-table-column label="活动图片" align="center" prop="activityPictures" show-overflow-tooltip min-width="120">
                <template #default="scope">
                    <image-preview :src="scope.row.activityPictures" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="开始时间" align="center" prop="startTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="结束时间" align="center" prop="endTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="200">
                <template #default="scope">
                    <el-button v-if="scope.row.approveStatus == 2" link type="primary" icon="Edit"
                        @click="handleProcess(scope.row)" v-hasPermi="['activityInfo:selfRecord:edit']">审核</el-button>
                    <el-button v-else link type="primary" icon="View" @click="handleView(scope.row)"
                        v-hasPermi="['activityInfo:selfRecord:edit']">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 审核/查看活动信息对话框 -->
        <el-dialog :title="title" v-model="open" width="800px" append-to-body>
            <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="auto">
                <el-form-item label="活动名称">
                    <el-input v-model="processForm.activityName" placeholder="请输入活动名称" readonly />
                </el-form-item>
                <el-form-item label="活动地址">
                    <el-input v-model="processForm.address" placeholder="请输入活动地址" readonly />
                </el-form-item>
                <el-form-item label="活动详情">
                    <el-input v-model="processForm.details" type="textarea" placeholder="请输入内容" readonly />
                </el-form-item>
                <el-form-item label="服务领域">
                    <el-select v-model="processForm.serviceField" placeholder="请选择服务领域" style="width: 100%" disabled>
                        <el-option
                            v-for="dict in service_field"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="服务对象">
                    <el-select v-model="processForm.serviceObject" placeholder="请选择服务对象" style="width: 100%" disabled>
                        <el-option
                            v-for="dict in service_object"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="服务场所">
                    <el-select v-model="processForm.serviceLocation" placeholder="请选择服务场所" style="width: 100%" disabled>
                        <el-option
                            v-for="dict in service_location"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-date-picker clearable v-model="processForm.startTime" type="date" value-format="yyyy-MM-dd"
                        placeholder="请选择开始时间" style="width: 100%;" disabled>
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker clearable v-model="processForm.endTime" type="date" value-format="yyyy-MM-dd"
                        placeholder="请选择结束时间" style="width: 100%;" disabled>
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="审核状态" prop="isPass" v-if="isProcessMode">
                    <!-- <el-radio-group v-model="processForm.isPass">
                        <el-radio v-for="dict in activity_status" :key="dict.value" :label="dict.value">{{ dict.label
                        }}</el-radio>
                    </el-radio-group> -->
                    <el-radio-group v-model="processForm.isPass">
                        <el-radio :label="2">通过</el-radio>
                        <el-radio :label="1">拒绝</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitProcessForm" v-if="isProcessMode">确 定</el-button>
                    <el-button @click="cancelProcess">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="SelfRecord">
import { listSelfRecord, getSelfRecord, processActivity } from "@/api/volunteer/userReportedActivityApproval";

const { proxy } = getCurrentInstance();
const { activity_status, service_field, service_object, service_location } = proxy.useDict('activity_status', 'service_field', 'service_object', 'service_location');

const selfRecordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const isProcessMode = ref(false); // 是否为审核模式

// 审核表单数据
const processForm = reactive({
    activityId: null,
    activityName: null,
    address: null,
    details: null,
    serviceField: null,
    serviceObject: null,
    serviceLocation: null,
    startTime: null,
    endTime: null,
    isPass: 2,
});

// 获取标签类型
const getTagType = (value) => {
    if (!activity_status.value) return 'info'

    // 确保比较时类型一致，都转换为字符串
    const item = activity_status.value.find(dict => dict.value === String(value))

    // 优先使用配置中的类型
    if (item && item.elTagType) {
        return item.elTagType
    }

    // 默认映射
    const defaultTypeMap = {
        '1': 'info',    // 未提交
        '2': 'warning', // 待审核
        '3': 'success', // 已通过
        '4': 'danger'   // 已驳回
    }

    return defaultTypeMap[String(value)] || 'info'
}

// 获取标签文本
const getLabel = (value) => {
    if (!activity_status.value) return '未知状态'

    // 确保比较时类型一致，都转换为字符串
    const item = activity_status.value.find(dict => dict.value === String(value))

    return item ? item.label : '未知状态'
}

// 审核表单规则
const processRules = {
    isPass: [
        { required: true, message: '请选择审核状态', trigger: 'change' }
    ]
};

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: null,
        duration: null,
        recruitNumber: null,
        address: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
        organizerName: null,
        organizerEmail: null,
        details: null,
        activityPictures: null,
        startTime: null,
        endTime: null,
        fileId: null,
        deptId: null,
        approveStatus: null
    },
    rules: {
        activityName: [
            { required: true, message: "活动名称不能为空", trigger: "blur" }
        ],
    }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询活动信息列表 */
function getList() {
    loading.value = true;
    listSelfRecord(queryParams.value).then(response => {
        selfRecordList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}

// 取消审核按钮
function cancelProcess() {
    open.value = false;
    resetProcessForm();
}

// 重置审核表单
function resetProcessForm() {
    Object.assign(processForm, {
        activityId: null,
        activityName: null,
        address: null,
        details: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
        startTime: null,
        endTime: null,
        isPass: 2,
    });
    isProcessMode.value = false;
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
    ids.value = selection.map(item => item.activityId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 处理审核按钮操作 */
function handleProcess(row) {
    resetProcessForm();
    const activityId = row.activityId;
    getSelfRecord(activityId).then(response => {
        const data = response.data;
        processForm.activityId = data.activityId;
        processForm.activityName = data.activityName;
        processForm.address = data.address;
        processForm.details = data.details;
        processForm.serviceField = data.serviceField;
        processForm.serviceObject = data.serviceObject;
        processForm.serviceLocation = data.serviceLocation;
        processForm.startTime = data.startTime;
        processForm.endTime = data.endTime;
        isProcessMode.value = true;
        open.value = true;
        title.value = "审核活动信息";
    });
}

/** 处理查看按钮操作 */
function handleView(row) {
    resetProcessForm();
    const activityId = row.activityId;
    getSelfRecord(activityId).then(response => {
        const data = response.data;
        processForm.activityId = data.activityId;
        processForm.activityName = data.activityName;
        processForm.address = data.address;
        processForm.details = data.details;
        processForm.serviceField = data.serviceField;
        processForm.serviceObject = data.serviceObject;
        processForm.serviceLocation = data.serviceLocation;
        processForm.startTime = data.startTime;
        processForm.endTime = data.endTime;
        isProcessMode.value = false;
        open.value = true;
        title.value = "查看活动信息";
    });
}

/** 提交审核表单 */
function submitProcessForm() {
    proxy.$refs["processFormRef"].validate(valid => {
        if (valid) {
            const { activityId, isPass } = processForm;
            // 将 isPass 转换为布尔值 
            const isApproved = isPass == 2 ? true : false;
            const param = {
                activityId,
                isPass: isApproved  // 发送转换后的布尔值
            };

            processActivity(param).then(response => {
                proxy.$modal.msgSuccess("审核成功");
                open.value = false;
                getList();
            }).catch(error => {
                proxy.$modal.msgError("审核失败: " + (error.message || error));
            });
        }
    });
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('activityInfo/selfRecord/export', {
        ...queryParams.value
    }, `selfRecord_${new Date().getTime()}.xlsx`)
}

getList();
</script>