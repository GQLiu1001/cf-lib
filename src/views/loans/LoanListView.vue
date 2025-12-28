<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppFormDialog from '../../components/AppFormDialog.vue'
import AppSearchBar from '../../components/AppSearchBar.vue'
import AppTable from '../../components/AppTable.vue'
import { borrowBook, fetchLoans, returnBook } from '../../api/loans.js'
import { useAuth } from '../../auth/useAuth.js'
import { notifyError } from '../../utils/notify.js'

const { user, isLoggedIn, hasRoles } = useAuth()
const canBorrow = computed(() => hasRoles(['LIBRARIAN', 'READER']))
const isReader = computed(() => hasRoles(['READER']) && !hasRoles(['ADMIN', 'LIBRARIAN']))

const statusOptions = [
  { value: 1, label: '借出中' },
  { value: 2, label: '已归还' },
  { value: 3, label: '逾期未还' },
  { value: 4, label: '已取消' },
]

const filters = reactive({
  userId: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const rows = ref([])
const loading = ref(false)

const borrowDialogOpen = ref(false)
const returnDialogOpen = ref(false)
const actionLoading = ref(false)

const borrowForm = reactive({
  copyId: '',
  days: 14,
})

const returnForm = reactive({
  copyId: '',
})

const columns = computed(() => {
  const base = [
    { label: '借阅单号', field: 'loanNo', width: '180px' },
  ]
  if (!isReader.value) {
    base.push({ label: '用户ID', field: 'userId', width: '120px' })
  }
  base.push(
    { label: '副本ID', field: 'copyId', width: '120px' },
    { label: '借出时间', field: 'borrowedAt', width: '160px' },
    { label: '应还时间', field: 'dueAt', width: '160px' },
    { label: '归还时间', field: 'returnedAt', width: '160px' },
    { label: '状态', field: 'status', width: '120px' },
  )
  if (canBorrow.value) {
    base.push({ label: '操作', field: 'actions', width: '140px' })
  }
  return base
})

const loadLoans = async () => {
  if (!isLoggedIn.value) {
    rows.value = []
    pagination.total = 0
    return
  }
  loading.value = true
  try {
    const userId = isReader.value ? user.value?.id : filters.userId
    const data = await fetchLoans({
      page: pagination.page,
      size: pagination.size,
      userId: userId || undefined,
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

const handleSearch = () => {
  pagination.page = 1
  loadLoans()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadLoans()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadLoans()
}

const openBorrowDialog = () => {
  Object.assign(borrowForm, { copyId: '', days: 14 })
  borrowDialogOpen.value = true
}

const openReturnDialog = (row) => {
  returnForm.copyId = row?.copyId || ''
  returnDialogOpen.value = true
}

const submitBorrow = async () => {
  if (!borrowForm.copyId || !borrowForm.days) {
    notifyError('请填写副本ID和借阅天数')
    return
  }
  actionLoading.value = true
  try {
    await borrowBook({ copyId: borrowForm.copyId, days: borrowForm.days })
    borrowDialogOpen.value = false
    await loadLoans()
  } finally {
    actionLoading.value = false
  }
}

const submitReturn = async () => {
  if (!returnForm.copyId) {
    notifyError('请输入副本ID')
    return
  }
  actionLoading.value = true
  try {
    await returnBook({ copyId: returnForm.copyId })
    returnDialogOpen.value = false
    await loadLoans()
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadLoans()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">借阅记录</h2>
        <p class="text-muted">支持按状态筛选，读者仅查看本人记录。</p>
      </div>
      <div class="header-actions">
        <button v-if="canBorrow" class="btn btn-primary" type="button" @click="openBorrowDialog">
          借书
        </button>
      </div>
    </div>

    <p v-if="!isLoggedIn" class="text-muted">请登录后查看借阅记录。</p>

    <template v-else>
      <AppSearchBar>
        <label v-if="!isReader" class="form-row">
          <span>用户ID</span>
          <input v-model="filters.userId" placeholder="请输入用户ID" />
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
        <template v-if="canBorrow" #cell-actions="{ row }">
          <div class="table-actions">
            <button
              v-if="Number(row.status) === 1 || Number(row.status) === 3"
              class="btn btn-link"
              type="button"
              @click="openReturnDialog(row)"
            >
              还书
            </button>
          </div>
        </template>
      </AppTable>
    </template>
  </section>

  <AppFormDialog
    v-model="borrowDialogOpen"
    title="借书"
    :loading="actionLoading"
    confirm-text="提交"
    @confirm="submitBorrow"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>副本ID</span>
        <input v-model="borrowForm.copyId" placeholder="请输入副本ID" />
      </label>
      <label class="form-row">
        <span>借阅天数</span>
        <input v-model.number="borrowForm.days" type="number" min="1" />
      </label>
    </div>
  </AppFormDialog>

  <AppFormDialog
    v-model="returnDialogOpen"
    title="还书"
    :loading="actionLoading"
    confirm-text="提交"
    @confirm="submitReturn"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>副本ID</span>
        <input v-model="returnForm.copyId" placeholder="请输入副本ID" />
      </label>
    </div>
  </AppFormDialog>
</template>
