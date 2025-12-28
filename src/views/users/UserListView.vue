<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppFormDialog from '../../components/AppFormDialog.vue'
import AppSearchBar from '../../components/AppSearchBar.vue'
import AppTable from '../../components/AppTable.vue'
import { fetchUsers, createUser, updateUser, deleteUser, updateUserRoles } from '../../api/users.js'
import { fetchRoles } from '../../api/roles.js'
import { notifyError } from '../../utils/notify.js'

const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '禁用' },
]

const filters = reactive({
  keyword: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const rows = ref([])
const loading = ref(false)
const roles = ref([])

const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)

const roleDialogOpen = ref(false)
const roleSaving = ref(false)
const roleForm = reactive({
  userId: '',
  roles: [],
})

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  status: 1,
  roles: [],
})

const columns = computed(() => [
  { label: '用户名', field: 'username', width: '140px' },
  { label: '昵称', field: 'nickname', width: '120px' },
  { label: '手机号', field: 'phone', width: '140px' },
  { label: '邮箱', field: 'email', width: '180px' },
  { label: '状态', field: 'status', width: '100px' },
  { label: '角色', field: 'roles' },
  { label: '操作', field: 'actions', width: '200px' },
])

const loadUsers = async () => {
  loading.value = true
  try {
    const data = await fetchUsers({
      page: pagination.page,
      size: pagination.size,
      keyword: filters.keyword,
      status: filters.status === '' ? undefined : Number(filters.status),
    })
    rows.value = data.items || []
    pagination.page = data.page
    pagination.size = data.size
    pagination.total = data.total
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  roles.value = await fetchRoles()
}

const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadUsers()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadUsers()
}

const openCreate = () => {
  editingId.value = null
  Object.assign(form, {
    username: '',
    password: '',
    nickname: '',
    phone: '',
    email: '',
    status: 1,
    roles: [],
  })
  dialogOpen.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    username: row.username ?? '',
    password: '',
    nickname: row.nickname ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    status: Number(row.status ?? 1),
    roles: row.roles ? [...row.roles] : [],
  })
  dialogOpen.value = true
}

const handleSubmit = async () => {
  if (!form.username || !form.nickname) {
    notifyError('请填写用户名和昵称')
    return
  }
  if (!editingId.value && !form.password) {
    notifyError('请填写密码')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateUser(editingId.value, {
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        status: Number(form.status),
      })
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        status: Number(form.status),
        roles: form.roles,
      })
    }
    dialogOpen.value = false
    await loadUsers()
  } finally {
    saving.value = false
  }
}

const openRoleDialog = (row) => {
  roleForm.userId = row.id
  roleForm.roles = row.roles ? [...row.roles] : []
  roleDialogOpen.value = true
}

const handleRoleSubmit = async () => {
  if (!roleForm.userId) {
    return
  }
  roleSaving.value = true
  try {
    await updateUserRoles(roleForm.userId, roleForm.roles)
    roleDialogOpen.value = false
    await loadUsers()
  } finally {
    roleSaving.value = false
  }
}

const handleDelete = async (row) => {
  if (!window.confirm(`确认删除用户「${row.username}」？`)) {
    return
  }
  await deleteUser(row.id)
  await loadUsers()
}

onMounted(async () => {
  await loadRoles()
  await loadUsers()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="text-muted">支持关键字和状态筛选。</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openCreate">新增用户</button>
    </div>

    <AppSearchBar>
      <label class="form-row">
        <span>关键字</span>
        <input v-model="filters.keyword" placeholder="用户名/昵称" />
      </label>
      <label class="form-row">
        <span>状态</span>
        <select v-model="filters.status">
          <option value="">全部</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <button class="btn btn-primary" type="button" @click="handleSearch">查询</button>
    </AppSearchBar>

    <AppTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #cell-status="{ row }">
        <span>{{ statusOptions.find((item) => item.value === Number(row.status))?.label || '-' }}</span>
      </template>
      <template #cell-roles="{ row }">
        <span>{{ row.roles?.join(', ') || '-' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="table-actions">
          <button class="btn btn-link" type="button" @click="openEdit(row)">编辑</button>
          <button class="btn btn-link" type="button" @click="openRoleDialog(row)">角色</button>
          <button class="btn btn-link" type="button" @click="handleDelete(row)">删除</button>
        </div>
      </template>
    </AppTable>
  </section>

  <AppFormDialog
    v-model="dialogOpen"
    :title="editingId ? '编辑用户' : '新增用户'"
    :loading="saving"
    confirm-text="保存"
    @confirm="handleSubmit"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>用户名</span>
        <input v-model="form.username" :disabled="Boolean(editingId)" placeholder="请输入用户名" />
      </label>
      <label v-if="!editingId" class="form-row">
        <span>密码</span>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </label>
      <label class="form-row">
        <span>昵称</span>
        <input v-model="form.nickname" placeholder="请输入昵称" />
      </label>
      <label class="form-row">
        <span>手机号</span>
        <input v-model="form.phone" placeholder="请输入手机号" />
      </label>
      <label class="form-row">
        <span>邮箱</span>
        <input v-model="form.email" type="email" placeholder="请输入邮箱" />
      </label>
      <label class="form-row">
        <span>状态</span>
        <select v-model.number="form.status">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <div v-if="!editingId" class="form-row">
        <span>角色</span>
        <div class="checkbox-group">
          <label v-for="role in roles" :key="role.roleCode" class="checkbox-item">
            <input v-model="form.roles" type="checkbox" :value="role.roleCode" />
            <span>{{ role.roleName }}</span>
          </label>
        </div>
      </div>
    </div>
  </AppFormDialog>

  <AppFormDialog
    v-model="roleDialogOpen"
    title="设置用户角色"
    :loading="roleSaving"
    confirm-text="保存"
    @confirm="handleRoleSubmit"
  >
    <div class="form-grid">
      <div class="form-row">
        <span>角色</span>
        <div class="checkbox-group">
          <label v-for="role in roles" :key="role.roleCode" class="checkbox-item">
            <input v-model="roleForm.roles" type="checkbox" :value="role.roleCode" />
            <span>{{ role.roleName }}</span>
          </label>
        </div>
      </div>
    </div>
  </AppFormDialog>
</template>
