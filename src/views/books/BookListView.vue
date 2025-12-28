<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppFormDialog from '../../components/AppFormDialog.vue'
import AppSearchBar from '../../components/AppSearchBar.vue'
import AppTable from '../../components/AppTable.vue'
import { fetchBooks, createBook, updateBook, deleteBook } from '../../api/books.js'
import { fetchCategories } from '../../api/categories.js'
import { useAuth } from '../../auth/useAuth.js'
import { notifyError } from '../../utils/notify.js'

const { hasRoles } = useAuth()
const canManage = computed(() => hasRoles(['ADMIN', 'LIBRARIAN']))

const categories = ref([])
const categoryMap = computed(() => {
  const map = new Map()
  categories.value.forEach((item) => map.set(item.id, item.name))
  return map
})

const filters = reactive({
  keyword: '',
  categoryId: '',
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
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publishDate: '',
  categoryId: '',
  tags: '',
  description: '',
})

const columns = computed(() => {
  const base = [
    { label: 'ISBN', field: 'isbn', width: '140px' },
    { label: '书名', field: 'title' },
    { label: '作者', field: 'author', width: '120px' },
    { label: '出版社', field: 'publisher', width: '160px' },
    { label: '出版日期', field: 'publishDate', width: '120px' },
    { label: '分类', field: 'categoryId', width: '140px' },
  ]
  if (canManage.value) {
    base.push({ label: '操作', field: 'actions', width: '160px' })
  }
  return base
})

const loadCategories = async () => {
  categories.value = await fetchCategories()
}

const loadBooks = async () => {
  loading.value = true
  try {
    const data = await fetchBooks({
      page: pagination.page,
      size: pagination.size,
      keyword: filters.keyword,
      categoryId: filters.categoryId,
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
  loadBooks()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadBooks()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadBooks()
}

const openCreate = () => {
  editingId.value = null
  Object.assign(form, {
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publishDate: '',
    categoryId: '',
    tags: '',
    description: '',
  })
  dialogOpen.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    isbn: row.isbn ?? '',
    title: row.title ?? '',
    author: row.author ?? '',
    publisher: row.publisher ?? '',
    publishDate: row.publishDate ?? '',
    categoryId: row.categoryId ?? '',
    tags: row.tags ?? '',
    description: row.description ?? '',
  })
  dialogOpen.value = true
}

const handleSubmit = async () => {
  if (!form.isbn || !form.title || !form.author || !form.publisher || !form.publishDate) {
    notifyError('请完善书目信息')
    return
  }
  if (!form.categoryId) {
    notifyError('请选择分类')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateBook(editingId.value, { ...form })
    } else {
      await createBook({ ...form })
    }
    dialogOpen.value = false
    await loadBooks()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  if (!window.confirm(`确认删除书目「${row.title}」？`)) {
    return
  }
  await deleteBook(row.id)
  await loadBooks()
}

onMounted(async () => {
  await loadCategories()
  await loadBooks()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">图书书目</h2>
        <p class="text-muted">支持关键字和分类检索。</p>
      </div>
      <button v-if="canManage" class="btn btn-primary" type="button" @click="openCreate">
        新增书目
      </button>
    </div>

    <AppSearchBar>
      <label class="form-row">
        <span>关键字</span>
        <input v-model="filters.keyword" placeholder="书名/作者" />
      </label>
      <label class="form-row">
        <span>分类</span>
        <select v-model="filters.categoryId">
          <option value="">全部分类</option>
          <option v-for="item in categories" :key="item.id" :value="item.id">
            {{ item.name }}
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
      <template #cell-categoryId="{ row }">
        <span>{{ categoryMap.get(row.categoryId) || row.categoryId || '-' }}</span>
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
    :title="editingId ? '编辑书目' : '新增书目'"
    :loading="saving"
    confirm-text="保存"
    @confirm="handleSubmit"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>ISBN</span>
        <input v-model="form.isbn" placeholder="请输入 ISBN" />
      </label>
      <label class="form-row">
        <span>书名</span>
        <input v-model="form.title" placeholder="请输入书名" />
      </label>
      <label class="form-row">
        <span>作者</span>
        <input v-model="form.author" placeholder="请输入作者" />
      </label>
      <label class="form-row">
        <span>出版社</span>
        <input v-model="form.publisher" placeholder="请输入出版社" />
      </label>
      <label class="form-row">
        <span>出版日期</span>
        <input v-model="form.publishDate" type="date" />
      </label>
      <label class="form-row">
        <span>分类</span>
        <select v-model="form.categoryId">
          <option value="">请选择分类</option>
          <option v-for="item in categories" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </label>
      <label class="form-row">
        <span>标签</span>
        <input v-model="form.tags" placeholder="逗号分隔标签" />
      </label>
      <label class="form-row">
        <span>描述</span>
        <textarea v-model="form.description" rows="3" placeholder="请输入描述"></textarea>
      </label>
    </div>
  </AppFormDialog>
</template>
