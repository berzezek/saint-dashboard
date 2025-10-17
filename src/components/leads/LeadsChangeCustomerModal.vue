<script setup lang="ts">
import { ref, computed, reactive, watchEffect } from 'vue'
import type { Lead } from "../../types"
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const state = reactive({
  name: undefined,
  email: undefined,
  phone: undefined,
  messenger: undefined
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  if (!state.phone) errors.push({ name: 'phone', message: 'Required' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<typeof state>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  console.log(event.data)
}

const open = defineModel<boolean>()

const props = defineProps<{
  lead: Lead
}>()

const customerId = ref<string>()
const search = ref('')

// Список клиентов
const customers = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john_doe@foo.bar",
    phone: "123-456-789",
    messenger: "john_doe"
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane_doe@foo.bar",
    phone: "987-654-321",
    messenger: "jane_doe"
  },
].map(customer => ({
  label: customer.name,
  email: customer.email,
  value: String(customer.id)
})))

const filteredCustomers = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return customers.value
  return customers.value.filter(customer =>
    customer.label.toLowerCase().includes(query)
  )
})

// Инициализация: сначала клиент из props
customerId.value = String(props.lead.customer.id)

// Автоматический выбор первого найденного при поиске
watchEffect(() => {
  const query = search.value.trim()
  if (query && filteredCustomers.value.length > 0) {
    customerId.value = filteredCustomers.value[0].value
  }
})

const updateCustomer = (value: string) => {
  console.log('Выбранный клиент:', value)
  customerId.value = value
}

const update = () => {
  console.log('Выбранный ID клиента:', customerId.value)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.lead.code"
    description="Выберите нового клиента для лида"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UInput v-model="search" placeholder="Поиск клиента..." class="mb-2 w-full" />
      <USelect
        v-model="customerId"
        :items="filteredCustomers"
        value-key="value"
        label-attribute="label"
        placeholder="Выберите клиента"
        class="w-full"
        @update:modelValue="updateCustomer"

      >
        <template #item-label="{ item }">
          <div class="flex flex-col">
            <span class="font-medium">{{ item.label }}</span>
            <span class="text-xs text-gray-500">{{ item.email }}</span>
          </div>
        </template>
      </USelect>


      <UForm :validate="validate" :state="state" class="space-y-4 mt-4" @submit="onSubmit">
        
        <UFormField label="Name" name="name">
          <UInput v-model="state.name" type="text"  class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="text" class="w-full" />
        </UFormField>
        
        <UFormField label="Phone" name="phone">
          <UInput v-model="state.phone"  type="text" class="w-full" />
        </UFormField>
                
        <UFormField label="Messenger" name="messenger">
          <UInput v-model="state.messenger"  type="text" class="w-full" />
        </UFormField>

        <UButton type="submit">
          Create
        </UButton>
      </UForm>

    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="primary" @click="update" />
    </template>
  </UModal>
</template>