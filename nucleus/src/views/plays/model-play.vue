<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { registry } from '@/core/services'
import { RpcService } from '@/core/services/rpc-service'

const rpc = registry.get<RpcService>('rpcService')

const availableModels = ref<string[]>([])
const defaultModel = ref('ir.cron')

onBeforeMount(async () => {
    const models = await rpc.searchRead('ir.model', [], 0, null, [], ['name'])
    availableModels.value = models.map(val => val['name'])
    defaultModel.value = 'ir.cron' // availableModels.value[0] || 'ir.cron'
    model.value = defaultModel.value
})

const model = ref(defaultModel.value)
const loading = ref(false)
const error = ref<string | null>(null)
const fields = ref<Record<string, any> | null>(null)
const filter = ref('')

const rawVisible = ref(false)
const rawJson = ref<string | null>(null)

const rows = computed(() => {
    if (!fields.value) return []
    return Object.entries(fields.value)
        .filter(
            ([k, v]) =>
                k.toLowerCase().includes(filter.value.toLowerCase()) ||
                v.string?.toLowerCase().includes(filter.value.toLowerCase()) ||
                v.type.toLowerCase().includes(filter.value.toLowerCase()),
        )
        .map(([name, field]) => ({ name, ...field }))
})

async function inspect() {
    loading.value = true
    error.value = null
    fields.value = null
    try {
        fields.value = await rpc.execute(model.value, 'fields_get', [[]], {})
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

const clearFilter = () => {
    filter.value = ''
}

function showRaw(data: any) {
    rawJson.value = data
    rawVisible.value = true
}

function closeRaw() {
    rawJson.value = null
    rawVisible.value = false
}
</script>

<template>
    <Dialog v-model:visible="rawVisible" modal header="Raw" class="max-w-3/4 max-h-3/4">
        <JsonViewer :value="rawJson" class="mb-2" />
        <template #footer>
            <Button type="button" label="Close" @click="closeRaw"></Button>
        </template>
    </Dialog>

    <Card>
        <template #title>Model Inspector</template>
        <template #content>
            <div class="flex gap-2 mb-4 items-center">
                <Select filter v-model="model" :options="availableModels" placeholder="Select model" />
                <Button label="Inspect" @click="inspect" :disabled="!model" />
            </div>

            <ErrorMessage :message="error" />
            <LoadingSpinner v-if="loading">Loading fields…</LoadingSpinner>

            <div style="display: flex; flex-direction: column; min-height: 400px">
                <DataTable
                    :value="rows"
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    paginator
                    scrollHeight="flex"
                    class="data-table"
                >
                    <template #header>
                        <div class="flex justify-between">
                            <InputGroup>
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filter" placeholder="Keyword Search" />
                                </IconField>
                                <InputGroupAddon>
                                    <Button
                                        icon="pi pi-filter-slash"
                                        severity="secondary"
                                        @click="clearFilter()"
                                    />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </template>
                    <Column header="Raw">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" @click="showRaw(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="name" header="Name" sortable />
                    <Column field="string" header="Label" sortable />
                    <Column field="type" header="Type" sortable />
                    <Column field="required" header="Required" />
                    <Column field="readonly" header="Readonly" />
                </DataTable>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.data-table :deep(tbody tr) {
    cursor: pointer;
}

.data-table :deep(tbody tr:hover) {
    background-color: var(--p-highlight-focus-background);
}
</style>
