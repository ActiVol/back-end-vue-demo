<!-- 用户自申请页面 -->
<template>
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
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                    v-hasPermi="['activityInfo:selfRecord:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['activityInfo:selfRecord:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['activityInfo:selfRecord:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['activityInfo:selfRecord:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="selfRecordList" @selection-change="handleSelectionChange" border>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="活动ID" align="center" prop="activityId" show-overflow-tooltip min-width="120" />
            <el-table-column label="活动名称" align="center" prop="activityName" show-overflow-tooltip min-width="120" />
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
            <!-- <el-table-column label="文件ID" align="center" prop="fileId" show-overflow-tooltip min-width="120" /> -->
            <el-table-column label="部门ID" align="center" prop="deptId" show-overflow-tooltip min-width="120" />
            <el-table-column label="审核状态" align="center" prop="approveStatus" show-overflow-tooltip min-width="120" />
            <!-- 申请人 -->
            <el-table-column label="申请人" align="center" prop="createName" show-overflow-tooltip min-width="120" />
            <!-- 申请时间 -->
            <el-table-column label="申请时间" align="center" prop="createTime" width="180"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="200">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['activityInfo:selfRecord:edit']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['activityInfo:selfRecord:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改活动信息对话框 -->
        <el-dialog :title="title" v-model="open" width="800px" append-to-body>
            <el-form ref="selfRecordRef" :model="form" :rules="rules" label-width="auto">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="活动名称" prop="activityName">
                            <el-input v-model="form.activityName" placeholder="请输入活动名称" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="活动时长" prop="duration">
                            <el-input v-model="form.duration" placeholder="请输入活动时长" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="招募人数" prop="recruitNumber">
                            <el-input v-model="form.recruitNumber" placeholder="请输入招募人数" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="活动地址" prop="address">
                            <el-input v-model="form.address" placeholder="请输入活动地址" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="服务领域" prop="serviceField">
                            <el-select v-model="form.serviceField" placeholder="请选择服务领域" style="width: 100%">
                                <el-option
                                    v-for="dict in service_field"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="服务对象" prop="serviceObject">
                            <el-select v-model="form.serviceObject" placeholder="请选择服务对象" style="width: 100%">
                                <el-option
                                    v-for="dict in service_object"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="服务场所" prop="serviceLocation">
                            <el-select v-model="form.serviceLocation" placeholder="请选择服务场所" style="width: 100%">
                                <el-option
                                    v-for="dict in service_location"
                                    :key="dict.value"
                                    :label="dict.label"
                                    :value="dict.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="举办者姓名" prop="organizerName">
                            <el-input v-model="form.organizerName" placeholder="请输入举办者姓名" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="举办者邮箱" prop="organizerEmail">
                            <el-input v-model="form.organizerEmail" placeholder="请输入举办者邮箱" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="开始时间" prop="startTime">
                            <el-date-picker clearable v-model="form.startTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择开始时间" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="结束时间" prop="endTime">
                            <el-date-picker clearable v-model="form.endTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择结束时间" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门ID" prop="deptId">
                            <el-input v-model="form.deptId" placeholder="请输入部门ID" :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="活动详情" prop="details">
                            <el-input v-model="form.details" type="textarea" placeholder="请输入内容"
                                :style="{ width: '100%' }" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="活动图片">
                            <image-upload ref="imageUploadRef" v-model="form.activityPictures" :limit="1" />
                        </el-form-item>
                    </el-col>
                </el-row>
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

<script setup name="SelfRecord">
import { listSelfRecord, getSelfRecord, delSelfRecord, addSelfRecord, updateSelfRecord } from "@/api/volunteer/selfApplication";

const { proxy } = getCurrentInstance();
// 添加字典数据引用
const { service_location, service_field, service_object } = proxy.useDict(
    "service_location",
    "service_field",
    "service_object"
);

const selfRecordList = ref([]);
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

// 取消按钮
function cancel() {
    open.value = false;
    reset();
}

// 表单重置
function reset() {
    form.value = {
        activityId: null,
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
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        approveStatus: null
    };
    proxy.resetForm("selfRecordRef");
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

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加活动信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _activityId = row.activityId || ids.value
    getSelfRecord(_activityId).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改活动信息";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["selfRecordRef"].validate(valid => {
        if (valid) {
            // 获取上传的图片文件ID
            const fileArray = proxy.$refs.imageUploadRef?.fileArray;
            const fileId = fileArray && fileArray.length ? fileArray[0].fileId : "";
            form.value.fileId = fileId;

            if (form.value.activityId != null) {
                updateSelfRecord(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addSelfRecord(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _activityIds = row.activityId || ids.value;
    proxy.$modal.confirm('是否确认删除活动信息编号为"' + _activityIds + '"的数据项？').then(function () {
        return delSelfRecord(_activityIds);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('activityInfo/selfRecord/export', {
        ...queryParams.value
    }, `selfRecord_${new Date().getTime()}.xlsx`)
}

getList();
</script>