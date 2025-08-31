<!-- 历史邮箱页面 -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="auto">
      <el-form-item label="邮件主题" prop="title">
        <el-input style="width: 240px;" v-model="queryParams.title" placeholder="请输入邮件主题" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="邮件接收者Id" prop="receiverUserId">
        <el-input style="width: 240px;" v-model="queryParams.receiverUserId" placeholder="请输入邮件接收者Id" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="邮件接收者名称" prop="receiverUserName">
        <el-input style="width: 240px;" v-model="queryParams.receiverUserName" placeholder="请输入邮件接收者名称" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="接收者邮箱" prop="receiverEmail">
        <el-input style="width: 240px;" v-model="queryParams.receiverEmail" placeholder="请输入接收者邮箱" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发送人" prop="sendUserId">
        <el-input style="width: 240px;" v-model="queryParams.sendUserId" placeholder="请输入发送人" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发送人名称" prop="sendUserName">
        <el-input style="width: 240px;" v-model="queryParams.sendUserName" placeholder="请输入发送人名称" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发送时间" prop="sendTime">
        <el-input style="width: 240px;" v-model="queryParams.sendTime" placeholder="请输入发送时间" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="${comment}" prop="isDelete">
        <el-input v-model="queryParams.isDelete" placeholder="请输入${comment}" clearable
          @keyup.enter="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:log:add']">新增</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:log:edit']">修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:log:remove']">删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:log:export']">导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange" border>
      <el-table-column show-overflow-tooltip type="selection" width="55" align="center" />
      <el-table-column show-overflow-tooltip label="邮件主题" align="center" prop="title" width="180px" />
      <el-table-column show-overflow-tooltip label="邮件内容" align="center" prop="content" width="180px" />
      <el-table-column show-overflow-tooltip label="邮件接收者Id" align="center" prop="receiverUserId" width="180px" />
      <el-table-column show-overflow-tooltip label="邮件接收者名称" align="center" prop="receiverUserName" width="180px" />
      <el-table-column show-overflow-tooltip label="接收者邮箱" align="center" prop="receiverEmail" width="180px" />
      <el-table-column show-overflow-tooltip label="发送人" align="center" prop="sendUserId" width="180px" />
      <el-table-column show-overflow-tooltip label="发送人名称" align="center" prop="sendUserName" width="180px" />
      <el-table-column show-overflow-tooltip label="发送时间" align="center" prop="sendTime" width="180px" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180px">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:log:edit']">查看</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:log:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改邮箱历史对话框 -->
    <el-dialog :title="title" v-model="open" width="60%" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" disabled>
        <el-form-item label="邮件主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入邮件主题" />
        </el-form-item>
        <el-form-item label="邮件内容">
          <editor v-model:value="form.content" :height="192" />
        </el-form-item>
        <el-form-item label="邮件接收者Id" prop="receiverUserId">
          <el-input v-model="form.receiverUserId" placeholder="请输入邮件接收者Id" />
        </el-form-item>
        <el-form-item label="邮件接收者名称" prop="receiverUserName">
          <el-input v-model="form.receiverUserName" placeholder="请输入邮件接收者名称" />
        </el-form-item>
        <el-form-item label="接收者邮箱" prop="receiverEmail">
          <el-input v-model="form.receiverEmail" placeholder="请输入接收者邮箱" />
        </el-form-item>
        <el-form-item label="发送人" prop="sendUserId">
          <el-input v-model="form.sendUserId" placeholder="请输入发送人" />
        </el-form-item>
        <el-form-item label="发送人名称" prop="sendUserName">
          <el-input v-model="form.sendUserName" placeholder="请输入发送人名称" />
        </el-form-item>
        <el-form-item label="发送时间" prop="sendTime">
          <el-input v-model="form.sendTime" placeholder="请输入发送时间" />
        </el-form-item>
        <el-form-item label="${comment}" prop="isDelete">
          <el-input v-model="form.isDelete" placeholder="请输入${comment}" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { listLog, getLog, delLog, addLog, updateLog } from "@/api/common/email"
import { ElMessage, ElMessageBox } from 'element-plus'

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 邮箱历史表格数据
const logList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: null,
  content: null,
  receiverUserId: null,
  receiverUserName: null,
  receiverEmail: null,
  sendUserId: null,
  sendUserName: null,
  sendTime: null,
  isDelete: null
})

// 表单参数
const form = reactive({
  id: null,
  title: null,
  content: null,
  receiverUserId: null,
  receiverUserName: null,
  receiverEmail: null,
  sendUserId: null,
  sendUserName: null,
  sendTime: null,
  isDelete: null
})

// 表单校验
const rules = {}

// 表单引用
const queryFormRef = ref(null)
const formRef = ref(null)

/** 查询邮箱历史列表 */
const getList = () => {
  loading.value = true
  listLog(queryParams).then(response => {
    logList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, {
    id: null,
    title: null,
    content: null,
    receiverUserId: null,
    receiverUserName: null,
    receiverEmail: null,
    sendUserId: null,
    sendUserName: null,
    sendTime: null,
    isDelete: null
  })

  if (formRef.value) {
    formRef.value.resetFields()
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = "添加邮箱历史"
}

/** 修改按钮操作 */
const handleUpdate = (row) => {
  reset()
  const id = row.id || ids.value
  getLog(id).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "查看邮箱历史"
  })
}

/** 提交按钮 */
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(valid => {
      if (valid) {
        if (form.id != null) {
          updateLog(form).then(response => {
            ElMessage.success("修改成功")
            open.value = false
            getList()
          })
        } else {
          addLog(form).then(response => {
            ElMessage.success("新增成功")
            open.value = false
            getList()
          })
        }
      }
    })
  }
}

/** 删除按钮操作 */
const handleDelete = (row) => {
  const ids = row.id || ids.value
  ElMessageBox.confirm('是否确认删除邮箱历史编号为"' + ids + '"的数据项？', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    return delLog(ids)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
const handleExport = () => {
  // 这里需要根据实际的下载方法进行调整
  // download('system/log/export', {
  //   ...queryParams
  // }, `log_${new Date().getTime()}.xlsx`)
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>