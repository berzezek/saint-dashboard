<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { User } from "../../types"

const open = defineModel<boolean>()

const props = defineProps<{
  author: User
}>()

const authorId = ref<string>()
const search = ref('')

// Список авторов
const authors = ref([
  {
    id: 1,
    name: "Chack Norris",
    email: "john_doe@foo.bar",
    status: "subscribed",
    location: "Pushkina st. 40"
  },
  {
    id: 2,
    name: "John Doe",
    email: "john_doe@foo.bar",
    status: "subscribed",
    location: "SPB"
  },
  {
    id: 3,
    name: "Jane Doe",
    email: "jane_doe@foo.bar",
    status: "subscribed",
    location: "SPB"
  }
].map(author => ({
  label: author.name,
  email: author.email,
  value: String(author.id)
})))

const filteredAuthors = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return authors.value
  return authors.value.filter(author =>
    author.label.toLowerCase().includes(query)
  )
})

// Инициализация: сначала автор из props
authorId.value = String(props.author.id)

// Автоматический выбор первого найденного при поиске
watchEffect(() => {
  const query = search.value.trim()
  if (query && filteredAuthors.value.length > 0) {
    authorId.value = filteredAuthors.value[0].value
  }
})

const updateAuthor = (value: string) => {
  console.log('Выбранный автор:', value)
  authorId.value = value
}

const update = () => {
  console.log('Выбранный ID автора:', authorId.value)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.author.name"
    description="Выберите нового автора для лида"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UInput v-model="search" placeholder="Поиск автора..." class="mb-2 w-full" />
      <USelect
        v-model="authorId"
        :items="filteredAuthors"
        value-key="value"
        label-attribute="label"
        placeholder="Выберите автора"
        class="w-full"
        @update:modelValue="updateAuthor"

      >
        <template #item-label="{ item }">
          <div class="flex flex-col">
            <span class="font-medium">{{ item.label }}</span>
            <span class="text-xs text-gray-500">{{ item.email }}</span>
          </div>
        </template>
      </USelect>

    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="primary" @click="update" />
    </template>
  </UModal>
</template>