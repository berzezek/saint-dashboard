<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Lead, Product, Category } from "../../types"

const open = defineModel<boolean>()

const props = defineProps<{
  lead: Lead
}>()

const productId = ref<string>()
const categoryId = ref<string>()
const search = ref('')

// Список продуктов
const products = ref<Product[]>([
  {
    id: 1,
    name: "Super App",
    category: { id: 1, name: "Bosch" }
  },
  {
    id: 2,
    name: "New Product",
    category: { id: 2, name: "Moulinex" }
  },
  {
    id: 3,
    name: "Mega Tool",
    category: { id: 1, name: "Bosch" }
  }
])

// Уникальные категории
const categories = computed(() => {
  const unique = new Map<number, Category>()
  products.value.forEach(p => unique.set(p.category.id, p.category))
  return Array.from(unique.values()).map(c => ({
    label: c.name,
    value: String(c.id)
  }))
})

// Фильтрация продуктов по категории и поиску
const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return products.value
    .filter(p => !categoryId.value || String(p.category.id) === categoryId.value)
    .filter(p => p.name.toLowerCase().includes(query))
    .map(p => ({
      label: `${p.category.name} — ${p.name}`,
      value: String(p.id),
      category: p.category.name
    }))
})

// Инициализация: продукт и категория из props
productId.value = String(props.lead.product.id)
categoryId.value = String(props.lead.product.category.id)

// Автоматический выбор первого найденного при поиске
watchEffect(() => {
  const query = search.value.trim()
  if (query && filteredProducts.value.length > 0) {
    productId.value = filteredProducts.value[0].value
  }
})

// Добавление новой категории
const newCategoryName = ref('')
const addCategory = () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  const newId = Math.max(...products.value.map(p => p.category.id)) + 1
  const newCategory: Category = { id: newId, name }
  products.value.push({
    id: Math.max(...products.value.map(p => p.id)) + 1,
    name: `New Product for ${name}`,
    category: newCategory
  })
  categoryId.value = String(newId)
  newCategoryName.value = ''
}

// Добавление нового продукта
const newProductName = ref('')
const addProduct = () => {
  const name = newProductName.value.trim()
  if (!name || !categoryId.value) return
  const category = products.value.find(p => String(p.category.id) === categoryId.value)?.category
  if (!category) return
  const newId = Math.max(...products.value.map(p => p.id)) + 1
  products.value.push({
    id: newId,
    name,
    category
  })
  productId.value = String(newId)
  newProductName.value = ''
}

const updateProduct = (value: string) => {
  productId.value = value
}

const update = () => {
  console.log('Выбранный ID продукта:', productId.value)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.lead.code"
    description="Выберите или добавьте продукт для лида"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <!-- Категория -->
      <USelect
        v-model="categoryId"
        :items="categories"
        value-key="value"
        label-attribute="label"
        placeholder="Фильтр по категории"
        class="mb-2 w-full"
      />

      <!-- Добавить категорию -->
      <div class="flex gap-2 mb-4">
        <UInput v-model="newCategoryName" placeholder="Новая категория" class="flex-1" />
        <UButton label="Добавить категорию" @click="addCategory" />
      </div>

      <!-- Поиск -->
      <UInput
        v-model="search"
        placeholder="Поиск продукта..."
        class="mb-2 w-full"
      />

      <!-- Селект продукта -->
      <USelect
        v-model="productId"
        :items="filteredProducts"
        value-key="value"
        label-attribute="label"
        placeholder="Выберите продукт"
        class="w-full"
        @update:modelValue="updateProduct"
      >
        <template #item-label="{ item }">
          <div class="flex flex-col">
            <span class="font-medium">{{ item.label }}</span>
            <span class="text-xs text-gray-500">{{ item.category }}</span>
          </div>
        </template>
      </USelect>

      <!-- Добавить продукт -->
      <div class="flex gap-2 mt-4">
        <UInput v-model="newProductName" placeholder="Новый продукт" class="flex-1" />
        <UButton label="Добавить продукт" @click="addProduct" />
      </div>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="primary" @click="update" />
    </template>
  </UModal>
</template>