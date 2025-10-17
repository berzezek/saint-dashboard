<script setup lang="ts">
import { ref } from 'vue'
import type { Lead } from "../../types"

// v-model
const open = defineModel<boolean>()

// обычный пропс
const props = defineProps<{
  lead: Lead
}>()


const statuses = ref(['NEW', 'CALLBACK'])
const status = ref(props.lead.status)

const emit = defineEmits(['setStatus']);

const updateStatus = (value: string) => {
  status.value = value
}

const update = () => {
	open.value = false
  emit('setStatus', status.value);
}
</script>


<template>
  <UModal v-model:open="open" :title="props.lead.code" description="This is useful when you want a form in a Modal." :ui="{ footer: 'justify-end' }">

    <template #body>
			<USelect v-model="status" :items="statuses" @update:modelValue="updateStatus" class="w-full" />
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="neutral" @click="update"/>
    </template>
  </UModal>
</template>