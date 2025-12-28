<script setup>
import { onMounted, ref } from 'vue'
import AppTable from '../../components/AppTable.vue'
import { fetchRoles } from '../../api/roles.js'

const rows = ref([])
const loading = ref(false)

const columns = [
  { label: '角色编码', field: 'roleCode', width: '160px' },
  { label: '角色名称', field: 'roleName' },
  { label: '状态', field: 'status', width: '100px' },
]

const loadRoles = async () => {
  loading.value = true
  try {
    rows.value = await fetchRoles()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<template>
  <section class="card">
    <div class="page-header">
      <div>
        <h2 class="page-title">角色列表</h2>
        <p class="text-muted">系统角色仅展示。</p>
      </div>
    </div>

    <AppTable :columns="columns" :rows="rows" :loading="loading">
      <template #cell-status="{ row }">
        <span>{{ Number(row.status) === 1 ? '正常' : '禁用' }}</span>
      </template>
    </AppTable>
  </section>
</template>
