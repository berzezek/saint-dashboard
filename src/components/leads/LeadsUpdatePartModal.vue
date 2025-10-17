<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { Part } from "../../types"

// Двусторонняя связь с родителем (открыть/закрыть модалку)
const open = defineModel<boolean>()

// Разрешим null, чтобы безопасно рендериться
const props = defineProps<{
  part: Part | null
}>()

// ---- Моки задач (вместо статусов) ----
type Task = {
  id: number
  name: string
  price: number
  value: number
}

const tasks = ref<Task[]>([
  { id: 101, name: 'Диагностика',     price: 50, value: 2 },
  { id: 102, name: 'Установка ПО',    price: 120, value: 2 },
  { id: 103, name: 'Настройка сети',  price: 90, value: 2  },
  { id: 104, name: 'Замена модуля',   price: 200, value: 2 },
  { id: 105, name: 'Тестирование',    price: 80, value: 2  },
])

// Опции для USelect
type TaskOption = { label: string; value: string; price: number }
const taskOptions = computed<TaskOption[]>(() =>
  tasks.value.map(t => ({
    label: t.name,
    value: String(t.id),
    price: t.price
  }))
)

// Поиск
const search = ref('')

// Фильтрация задач по search
const filteredTaskOptions = computed<TaskOption[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return taskOptions.value
  return taskOptions.value.filter(o => o.label.toLowerCase().includes(q))
})

// ---- Состояние формы ----
const state = reactive<{
  taskId: string | null
  value: number
}>({
  taskId: null,
  value: props.part?.value ?? 1
})

// Выбранная задача (по всему списку, чтобы не «теряться» при фильтрации)
const selectedTask = computed(() =>
  taskOptions.value.find(o => o.value === state.taskId) ?? null
)

// Цена и итоги
const unitPrice = computed<number>(() =>
  selectedTask.value?.price ?? props.part?.price ?? 0
)
const total = computed<number>(() => unitPrice * (Number(state.value) || 0))

// Обновляем локальное состояние при смене part
watch(
  () => props.part,
  (p) => {
    // При новом part сбрасываем выбор задачи (или можно попытаться сопоставить)
    state.taskId = null
    state.value = p?.value ?? 1
  },
  { immediate: true }
)

// Заголовок безопасно
const title = computed(() => (props.part ? `Task #${props.part.id}` : 'Task'))

// Простая валидация
const validate = (s: typeof state): FormError[] => {
  const errors: FormError[] = []
  if (!s.taskId) errors.push({ name: 'taskId', message: 'Выберите задачу' })
  if (s.value == null || Number(s.value) <= 0)
    errors.push({ name: 'value', message: 'Количество должно быть > 0' })
  return errors
}

const toast = useToast()

// Можно эмитить наружу сохранение (чтобы родитель обновил invoice/part)
const emit = defineEmits<{
  (e: 'save', payload: {
    partId: number
    taskId: number
    taskName: string
    unitPrice: number
    value: number
    total: number
  }): void
}>()

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  if (!props.part || !selectedTask.value) return

  const payload = {
    partId: props.part.id,
    taskId: Number(state.taskId),
    taskName: selectedTask.value.label,
    unitPrice: unitPrice.value,
    value: Number(state.value),
    total: props.part.price * props.part.value
  }

  emit('save', payload)
  toast.add({ title: 'Сохранено', description: 'Задача обновлена', color: 'success' })
  open.value = false
}

const closeModal = () => {
  open.value = false
}
</script>

<template>
  <!-- Рендерим только когда есть part -->
  <UModal
    v-if="props.part"
    v-model:open="open"
    :title="title"
    description="Выберите задачу для лида"
    :ui="{ footer: 'justify-end' }"
    :key="props.part.id"
  >
    <template #body>
      <!-- Поиск по задачам -->
      <UInput v-model="search" placeholder="Найти задачу..." class="mb-2 w-full" />

      <UForm :validate="validate" :state="state" class="space-y-4 mt-4" @submit="onSubmit">
        <div class="flex flex-wrap items-start gap-4">
          <!-- Задача -->
          <UFormField label="Задача" name="taskId" class="flex-1 min-w-64">
            <USelect
              v-model="state.taskId"
              :items="filteredTaskOptions"
              value-key="value"
              label-attribute="label"
              placeholder="Выберите задачу"
              class="w-full"
            >
              <template #item-label="{ item }">
                <div class="flex items-center justify-between w-full">
                  <span class="font-medium">{{ item.label }}</span>
                  <span class="text-xs text-gray-500">$ {{ item.price }}</span>
                </div>
              </template>
            </USelect>
          </UFormField>

          <!-- Цена (от выбранной задачи или из part) -->
          <UFormField label="Цена" name="price">
            <p class="me-2 mt-2">$ {{ unitPrice }}</p>
          </UFormField>

          <!-- Количество -->
          <UFormField label="Количество" name="value" class="w-28">
            <UInput v-model.number="state.value" type="number" min="1" />
          </UFormField>
        </div>

        <!-- Итог -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Итого</span>
          <span class="font-semibold">$ {{ total }}</span>
        </div>

        <UButton type="submit">
          Сохранить
        </UButton>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="primary" @click="closeModal" />
    </template>
  </UModal>
</template>
