<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['page-change', 'size-change'])

const totalPages = computed(() => {
  if (!props.pagination) {
    return 1
  }
  const { total = 0, size = 10 } = props.pagination
  return Math.max(1, Math.ceil(total / size))
})

const pageSizes = [10, 20, 50]

const getRowKey = (row) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row?.[props.rowKey]
}

const handlePageChange = (next) => {
  if (!props.pagination) {
    return
  }
  const { page = 1 } = props.pagination
  if (next < 1 || next > totalPages.value || next === page) {
    return
  }
  emit('page-change', next)
}

const handleSizeChange = (event) => {
  if (!props.pagination) {
    return
  }
  const next = Number(event.target.value)
  emit('size-change', next)
}
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.field" :style="{ width: column.width }">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td class="table-empty" :colspan="columns.length">加载中...</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td class="table-empty" :colspan="columns.length">暂无数据</td>
        </tr>
        <tr v-for="row in rows" :key="getRowKey(row)">
          <td v-for="column in columns" :key="column.field">
            <slot :name="`cell-${column.field}`" :row="row">
              {{ row?.[column.field] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="pagination" class="table-footer">
      <div class="table-meta">共 {{ pagination.total ?? 0 }} 条</div>
      <div class="pager">
        <button
          class="btn"
          type="button"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          上一页
        </button>
        <span>{{ pagination.page }} / {{ totalPages }}</span>
        <button
          class="btn"
          type="button"
          :disabled="pagination.page >= totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          下一页
        </button>
        <select :value="pagination.size" @change="handleSizeChange">
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }} / 页
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
