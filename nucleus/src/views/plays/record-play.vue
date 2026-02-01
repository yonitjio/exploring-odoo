<script setup lang="ts">
import { ref } from 'vue'
import { registry } from '@/core/services'
import { RpcService } from '@/core/services/rpc-service'
import { RpcError } from '@/core/errors'

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
const domain = ref('[]')
const limit = ref(5)
const offset = ref(0)
const count = ref(0)

const loading = ref(false)
const error = ref<string | null>(null)

const records = ref<any[]>([])
const selected = ref<any>(null)

const detailVisible = ref(false)

async function search() {
    if (!model.value) return

    loading.value = true
    error.value = null
    records.value = []

    try {
        // Parse domain
        let dmn: any[]
        try {
            dmn = JSON.parse(domain.value)
            if (!Array.isArray(dmn)) {
                throw new Error('Domain must be a JSON array')
            }
        } catch (err) {
            throw new Error(
                `Invalid domain JSON: ${err instanceof Error ? err.message : 'Unknown error'}`,
            )
        }

        // Get total count
        const cnt = await rpc.execute(model.value, 'search_count', [dmn], {})
        count.value = cnt

        // Search for IDs
        const ids = await rpc.search(model.value, dmn, offset.value, limit.value, [], {})

        if (ids.length === 0) {
            records.value = []
            return
        }

        const fieldInfos = await rpc.execute(model.value, 'fields_get', [[]], {})

        const fields = Object.keys(fieldInfos)

        // Read records with all fields
        const recs = await rpc.read(model.value, ids, fields, {})

        records.value = recs
    } catch (err) {
        if (err instanceof RpcError) {
            error.value = `RPC Error (${err.code}): ${err.message}`
        } else {
            error.value = err instanceof Error ? err.message : 'Unknown error'
        }
    } finally {
        loading.value = false
    }
}

function showDetails(rec: any) {
    selected.value = rec
    detailVisible.value = true
}

async function goToOffset(val: number) {
    offset.value = val
    await search()
}

async function updateLimit(val: number) {
    limit.value = val
    await search()
}

const tableHeaders = computed(() => {
    if (records.value.length === 0) return []

    const firstRecord = records.value[0]
    const keys = Object.keys(firstRecord).slice(0, 5) // Limit to first 5 fields

    return keys.map((key) => ({
        title: key,
        key: key,
        sortable: false,
    }))
})

const tableItems = computed(() => {
    return records.value.map((record) => {
        const item: any = {}
        Object.keys(record)
            .slice(0, 10)
            .forEach((key) => {
                const value = record[key]
                if (value === null || value === undefined) {
                    item[key] = '-'
                } else if (Array.isArray(value)) {
                    item[key] = `[${value.length} items]`
                } else if (typeof value === 'object') {
                    if (value.__class__ === 'datetime') {
                        item[key] = new Date(
                            value.year,
                            value.month,
                            value.day,
                            value.hour,
                            value.minute,
                            value.second,
                        ).toISOString()
                    } else {
                        item[key] = JSON.stringify(value)
                    }
                } else {
                    item[key] = String(value)
                }
            })
        item._raw = record
        return item
    })
})

function reset() {
    records.value = []
    model.value = defaultModel.value
    domain.value = '[]'
    limit.value = 5
    offset.value = 0
}

function closeDetail() {
    selected.value = null
    detailVisible.value = false
}
</script>

<template>
    <Card>
        <template #title>Record Browser</template>
        <template #content>
            <div class="grid grid-cols-5 gap-2 mb-4">
                <Select filter v-model="model" :options="availableModels" placeholder="Select model" />
                <InputText v-model="domain" placeholder="Domain JSON" />
                <InputNumber v-model="limit" type="number" />
                <Button label="Search" @click="search" />
                <Button label="Reset" @click="reset" />
            </div>

            <ErrorMessage :message="error" />
            <LoadingSpinner v-if="loading">Searching…</LoadingSpinner>

            <Paginator :rows="limit" :totalRecords="count" :rowsPerPageOptions="[5, 10, 20]" :first="offset"
                @update:rows="updateLimit" @update:first="goToOffset" />
            <DataTable v-if="records.length" :value="tableItems" stripedRows class="data-table">
                <Column header="Details">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" @click="showDetails(slotProps.data)" />
                    </template>
                </Column>
                <Column v-for="header in tableHeaders" :key="header.key" :field="header.key" :header="header.title"
                    :sortable="header.sortable" />
            </DataTable>

            <Dialog v-model:visible="detailVisible" modal header="Record" class="max-w-3/4 max-h-3/4 ">
                <JsonViewer :value="selected" />
                <template #footer>
                    <Button type="button" label="Close" @click="closeDetail"></Button>
                </template>
            </Dialog>
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
