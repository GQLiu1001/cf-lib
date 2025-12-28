<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppFormDialog from '../../components/AppFormDialog.vue'
import AppTable from '../../components/AppTable.vue'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories.js'
import { useAuth } from '../../auth/useAuth.js'
import { notifyError } from '../../utils/notify.js'

const { hasRoles } = useAuth()
const canManage = computed(() => hasRoles(['ADMIN', 'LIBRARIAN']))

const categories = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)

const form = reactive({
  parentId: '0',
  name: '',
  code: '',
})

const categoryMap = computed(() => {
  const map = new Map()
  categories.value.forEach((item) => {
    map.set(item.id, item.name)
  })
  return map
})

const columns = computed(() => {
  const base = [
    { label: '分类名称', field: 'name' },
    { label: '编码', field: 'code' },
    { label: '上级分类', field: 'parentId' },
  ]
  if (canManage.value) {
    base.push({ label: '操作', field: 'actions', width: '160px' })
  }
  return base
})

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await fetchCategories()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  form.parentId = '0'
  form.name = ''
  form.code = ''
  dialogOpen.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  form.parentId = row.parentId ?? '0'
  form.name = row.name ?? ''
  form.code = row.code ?? ''
  dialogOpen.value = true
}

const handleSubmit = async () => {
  if (!form.name || !form.code) {
    notifyError('请填写分类名称和编码')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, { ...form })
    } else {
      await createCategory({ ...form })
    }
    dialogOpen.value = false
    await loadCategories()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  if (!window.confirm(`确认删除分类「${row.name}」？`)) {
    return
  }
  await deleteCategory(row.id)
  await loadCategories()
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">分类管理</h2>
        <p class="text-muted">支持查看全部分类，管理员/图书管理员可维护。</p>
      </div>
      <button v-if="canManage" class="btn btn-primary" type="button" @click="openCreate">
        新增分类
      </button>
    </div>

    <AppTable :columns="columns" :rows="categories" :loading="loading">
      <template #cell-parentId="{ row }">
        <span>{{ row.parentId === '0' ? '-' : categoryMap.get(row.parentId) || row.parentId }}</span>
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
    :title="editingId ? '编辑分类' : '新增分类'"
    :loading="saving"
    confirm-text="保存"
    @confirm="handleSubmit"
  >
    <div class="form-grid">
      <label class="form-row">
        <span>上级分类</span>
        <select v-model="form.parentId">
          <option value="0">顶级分类</option>
          <option v-for="item in categories" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </label>
      <label class="form-row">
        <span>分类名称</span>
        <input v-model="form.name" placeholder="请输入分类名称" />
      </label>
      <label class="form-row">
        <span>分类编码</span>
        <input v-model="form.code" placeholder="请输入分类编码" />
      </label>
    </div>
  </AppFormDialog>
</template>
