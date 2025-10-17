<template>
  <div class="p-4 w-full overflow-y-auto">
  <UCard variant="subtle" v-if="lead">
    <template #header>
      <div class="flex justify-around">
      <p>Lead # <UInput v-model="updateForm.code"/></p>
        <UButton :color="statusColor(updateForm.status)" @click="changeStatus">{{ updateForm.status }}</UButton>
      </div>

      <LeadsChangeStatusModal v-model="showLeadsChangeStatusModal" :lead="lead" @setStatus="setStatus" />

    </template>
    
    <!-- Customer -->
     <UCard variant="subtle">
        <template #header>
          <p>Customer</p>
        </template>

          <UUser
            :name="lead.customer.name"
            description="Software Engineer"
            :avatar="{
              src: 'https://i.pravatar.cc/150?u=john-doe'
            }"
            :chip="{
              color: 'primary',
              position: 'top-right'
            }"
          />
        <template #footer>
          <UButton @click="changeCustomer">Change</UButton>
        </template>
      </UCard>
      <LeadsChangeCustomerModal v-model="showLeadsChangeCustomerModal" :lead="lead"/>

    <!-- Author -->
     <UCard variant="subtle" class="my-4">
        <template #header>
          <p>Author</p>
        </template>

          <UUser
            :name="lead.author.name"
            description="Software Engineer"
            :avatar="{
              src: 'https://i.pravatar.cc/150?u=john-doe'
            }"
            :chip="{
              color: 'primary',
              position: 'top-right'
            }"
          />
        <template #footer>
          <UButton @click="changeAuthor">Change</UButton>
        </template>
      </UCard>
      <LeadsChangeAuthorModal v-model="showLeadsChangeAuthorModal" :author="lead.author"/>

    <!-- Product -->
     <UCard variant="subtle" class="my-4">
        <template #header>
          <p>Product</p>
        </template>

        <p>{{ lead.product.category.name }} {{ lead.product.name }}</p>
        <template #footer>
          <UButton @click="changeProduct">Change</UButton>
        </template>
      </UCard>
      <LeadsChangeProductModal v-model="showLeadsChangeProductModal" :lead="lead"/>

    <!-- Address -->
     <UCard variant="subtle" class="my-4">
        <template #header>
          <p>Address</p>
        </template>

        <UInput v-model="updateForm.address" class="w-full" />
          
      </UCard>

    <!-- Description -->
     <UCard variant="subtle" class="my-4">
        <template #header>
          <p>Description</p>
        </template>

        <UTextarea v-model="updateForm.description" class="mt-4 w-full" />
          
      </UCard>

    <template #footer>
      <UCard variant="subtle">
        <template #header>
          <div class="flex justify-around">
            <p>Invoice</p>
            <LeadsAddPartModal :lead="lead"/>
          </div>

        </template>
        <UTable :data="partsData" class="flex-1" @hover="hoverPart" @select="updatePart"/>
        
        <LeadsUpdatePartModal
          v-if="showLeadsUpdatePartModal && selectedPart"
          v-model="showLeadsUpdatePartModal"
          :part="selectedPart"
        />

        <hr class="mt-4" />
        <div class="flex justify-around mt-2">
          <p>Amount</p>
          <p>$ {{ totalPrice }}</p>
        </div>
      </UCard>
        <UButton @click="updateLead" class="mt-4">Update</UButton>
    </template>
  </UCard>
  <p v-else>Lead not found</p>
</div>
</template>


<script setup lang="ts">
import { useRoute } from "vue-router"
import { computed, ref, watchEffect } from "vue"
import { useLeadsStore } from "../../stores/leads"
import type { Part, PartData, UpdateLeadForm } from '../../types'
import type { TableRow } from '@nuxt/ui'

// Хранилище и маршрут
const leadsStore = useLeadsStore()
const route = useRoute()

// Модальные окна
const showLeadsChangeAuthorModal = ref(false)
const showLeadsChangeStatusModal = ref(false)
const showLeadsChangeCustomerModal = ref(false)
const showLeadsUpdatePartModal = ref(false)
const showLeadsChangeProductModal = ref(false)

// Получение лида по ID из маршрута
const lead = computed(() => {
  const id = Number(route.params.id)
  return leadsStore.byId(id) ?? null
})

// Формы и таблицы
const updateForm = ref<UpdateLeadForm>({} as UpdateLeadForm)
const partsData = ref<PartData[]>([])
const totalPrice = ref(0)

// Инициализация формы и данных при наличии лида
watchEffect(() => {
  if (lead.value) {
    updateForm.value = {
      id: lead.value.id,
      status: lead.value.status,
      author_id: lead.value.author.id,
      customer_id: lead.value.customer.id,
      product_id: lead.value.product.id,
      code: lead.value.code,
      description: lead.value.description,
      address: lead.value.address,
      parts: lead.value.parts.map(obj => obj.id)
    }

    partsData.value = lead.value.parts.map(part => ({
      ...part,
      price: `$ ${part.price}`,
      total: part.price * part.value
    }))

    totalPrice.value = lead.value.parts.reduce((sum, part) => sum + part.price * part.value, 0)
  }
})

// Цвет кнопки статуса
function statusColor(status: string) {
  switch (status) {
    case 'NEW': return 'primary'
    case 'CALLBACK': return 'secondary'
    case 'CLOSED': return 'success'
    default: return 'warning'
  }
}

// Работа с частями
const open = ref(false)
const selectedRow = ref<TableRow<PartData> | null>(null)
const selectedPart = ref({} as Part)

const hoverPart = (_e: Event, row: TableRow<PartData> | null) => {
  selectedRow.value = row
  open.value = !!row
}

const updatePart = (row: TableRow<PartData>) => {
  showLeadsUpdatePartModal.value = true
  // @ts-ignore
  selectedPart.value = row.original
}

// Модальные действия
const changeAuthor = () => {
  showLeadsChangeAuthorModal.value = true
}

const changeCustomer = () => {
  showLeadsChangeCustomerModal.value = true
}

const changeStatus = () => {
  showLeadsChangeStatusModal.value = true
}

const setStatus = (value: string) => {
  updateForm.value.status = value
}

// Обновление лида
const updateLead = () => {
  console.log(updateForm.value)
}

const changeProduct = () => {
  showLeadsChangeProductModal.value = true
}

// Горячие клавиши
defineShortcuts({
  o: () => showLeadsChangeStatusModal.value = !showLeadsChangeStatusModal.value
})
</script>