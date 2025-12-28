<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => emit('update:modelValue', false)
const confirm = () => emit('confirm')
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="dialog-mask" @click.self="close">
      <div class="dialog">
        <header class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="btn btn-link" type="button" @click="close">关闭</button>
        </header>
        <div class="dialog-body">
          <slot />
        </div>
        <footer class="dialog-footer">
          <button class="btn" type="button" @click="close">取消</button>
          <button class="btn btn-primary" type="button" :disabled="loading" @click="confirm">
            {{ loading ? '提交中...' : confirmText }}
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>
