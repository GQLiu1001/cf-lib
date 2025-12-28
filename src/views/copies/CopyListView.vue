<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppFormDialog from '../../components/AppFormDialog.vue'
import AppSearchBar from '../../components/AppSearchBar.vue'
import AppTable from '../../components/AppTable.vue'
import { fetchCopies, createCopy, updateCopy, deleteCopy } from '../../api/copies.js'
import { fetchBooks } from '../../api/books.js'
import { useAuth } from '../../auth/useAuth.js'
import { notifyError } from '../../utils/notify.js'

const { hasRoles } = useAuth()
const canManage = computed(() => hasRoles(['ADMIN', 'LIBRARIAN']))

const statusOptions = [
  { value: 1, label: '在馆' },
  { value: 2, label: '借出' },
  { value: 3, label: '遗失' },
  { value: 4, label: '维修' },
]

const books = ref([])
const bookMap = computed(() => {
  const map = new Map()
  books.value.forEach((item) => map.set(item.id, item.title))
  return map
})

const filters = reactive({
  bookId: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const rows = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)

const form = reactive({
  bookId: '',
  bookTitle: '',
  copyCode: '',
  location: '',
  status: 1,
})

const bookDropdownOpen = ref(false)
const bookPagination = reactive({
  page: 1,
  size: 6,
  total: 0,
})
const bookRows = ref([])
const bookLoading = ref(false)
const bookTotalPages = computed(() => {
  if (!bookPagination.total) {
    return 1
  }
  return Math.max(1, Math.ceil(bookPagination.total / bookPagination.size))
})

const columns = computed(() => {
  const base = [
    { label: '副本编号', field: 'copyCode', width: '160px' },
    { label: '书目', field: 'bookId' },
    { label: '馆藏位置', field: 'location', width: '140px' },
    { label: '状态', field: 'status', width: '120px' },
  ]
  if (canManage.value) {
    base.push({ label: '操作', field: 'actions', width: '160px' })
  }
  return base
})

const loadBooks = async () => {
  const data = await fetchBooks({ page: 1, size: 200 })
  books.value = data.items || []
}

const loadBookDropdown = async () => {
  bookLoading.value = true
  try {
    const data = await fetchBooks({
      page: bookPagination.page,
      size: bookPagination.size,
      keyword: form.bookTitle,
    })
    bookRows.value = data.items || []
    bookPagination.page = data.page
    bookPagination.size = data.size
    bookPagination.total = data.total
  } finally {
    bookLoading.value = false
  }
}

const loadCopies = async () => {
  loading.value = true
  try {
    const data = await fetchCopies({
      page: pagination.page,
      size: pagination.size,
      bookId: filters.bookId || undefined,
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
  loadCopies()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadCopies()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadCopies()
}

const openCreate = () => {
  editingId.value = null
  Object.assign(form, {
    bookId: '',
    bookTitle: '',
    copyCode: '',
    location: '',
    status: 1,
  })
  dialogOpen.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    bookId: row.bookId ?? '',
    bookTitle: bookMap.value.get(row.bookId) || '',
    copyCode: row.copyCode ?? '',
    location: row.location ?? '',
    status: Number(row.status ?? 1),
  })
  dialogOpen.value = true
}

const handleSubmit = async () => {
  if (!form.bookId || !form.copyCode || !form.location) {
    notifyError('请填写完整副本信息')
    return
  }
  saving.value = true
  try {
    const payload = { ...form, status: Number(form.status) }
    if (editingId.value) {
      await updateCopy(editingId.value, payload)
    } else {
      await createCopy(payload)
    }
    dialogOpen.value = false
    await loadCopies()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  if (!window.confirm(`确认删除副本「${row.copyCode}」？`)) {
    return
  }
  await deleteCopy(row.id)
  await loadCopies()
}

const openBookDropdown = () => {
  bookDropdownOpen.value = true
  bookPagination.page = 1
  loadBookDropdown()
}

const handleBookInput = () => {
  form.bookId = ''
  if (!bookDropdownOpen.value) {
    bookDropdownOpen.value = true
  }
  bookPagination.page = 1
  loadBookDropdown()
}

const handleBookBlur = () => {
  setTimeout(() => {
    bookDropdownOpen.value = false
  }, 150)
}

const handleBookPageChange = (page) => {
  bookPagination.page = page
  loadBookDropdown()
}

const handleBookPrev = () => {
  if (bookPagination.page <= 1) {
    return
  }
  handleBookPageChange(bookPagination.page - 1)
}

const handleBookNext = () => {
  if (bookPagination.page >= bookTotalPages.value) {
    return
  }
  handleBookPageChange(bookPagination.page + 1)
}

const selectBook = (row) => {
  form.bookId = row.id
  form.bookTitle = row.title
  bookDropdownOpen.value = false
}

onMounted(async () => {
  await loadBooks()
  await loadCopies()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">图书副本</h2>
        <p class="text-muted">支持按书目或状态筛选。</p>
      </div>
      <button v-if="canManage" class="btn btn-primary" type="button" @click="openCreate">
        新增副本
      </button>
    </div>

    <AppSearchBar>
      <label class="form-row">
        <span>书目ID</span>
        <input v-model="filters.bookId" placeholder="请输入书目ID" />
      </label>
      <label class="form-row">
        <span>状态</span>
        <select v-model="filters.status">
          <option value="">全部状态</option>
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
      <template #cell-bookId="{ row }">
        <span>{{ bookMap.get(row.bookId) || row.bookId }}</span>
      </template>
      <template #cell-status="{ row }">
        <span>{{ statusOptions.find((item) => item.value === Number(row.status))?.label || '-' }}</span>
      </template>
      <template v-if="canManage" #cell-actions="{ row }">
        <div class="table-actions">
          <button class="btn btn-link" type="button" @click="openEdit(row)">编辑</button>
          <button class="btn btn-link" type="button" @click="handleDelete(row)">删除</button>
        </div>
      </template>
    </AppTable>
  </section>

  <AppFormDialog
    v-model="dialogOpen"
    :title="editingId ? '编辑副本' : '新增副本'"
    :loading="saving"
    confirm-text="保存"
    @confirm="handleSubmit"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>书目</span>
        <div class="dropdown-wrapper">
          <div class="input-inline">
            <input
              v-model="form.bookTitle"
              placeholder="输入书名/作者/ISBN"
              @focus="openBookDropdown"
              @input="handleBookInput"
              @blur="handleBookBlur"
            />
          </div>
          <div v-if="bookDropdownOpen" class="dropdown-panel dropdown-panel-absolute">
            <div v-if="bookLoading" class="dropdown-empty">加载中...</div>
            <div v-else-if="!bookRows.length" class="dropdown-empty">暂无匹配书目</div>
            <div v-else class="dropdown-list">
              <button
                v-for="item in bookRows"
                :key="item.id"
                class="dropdown-item"
                type="button"
                @mousedown.prevent="selectBook(item)"
              >
                <div class="dropdown-title">{{ item.title }}</div>
                <div class="dropdown-meta">{{ item.author }} · {{ item.isbn }}</div>
              </button>
            </div>
            <div class="dropdown-footer">
              <button
                class="btn"
                type="button"
                :disabled="bookPagination.page <= 1"
                @click="handleBookPrev"
              >
                上一页
              </button>
              <span class="dropdown-page">第 {{ bookPagination.page }} / {{ bookTotalPages }} 页</span>
              <button
                class="btn"
                type="button"
                :disabled="bookPagination.page >= bookTotalPages"
                @click="handleBookNext"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </label>
      <label class="form-row">
        <span>副本编号</span>
        <input v-model="form.copyCode" placeholder="请输入副本编号" />
      </label>
      <label class="form-row">
        <span>馆藏位置</span>
        <input v-model="form.location" placeholder="请输入馆藏位置" />
      </label>
      <label class="form-row">
        <span>状态</span>
        <select v-model.number="form.status">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  </AppFormDialog>
</template>
