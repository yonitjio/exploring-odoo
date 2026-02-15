<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { registry } from '@/core/services'
import { RpcService } from '@/core/services/rpc-service'
import { RpcError, TrytonRpcError } from '@/core/errors'

const rpc = registry.get<RpcService>('rpcService')

const availableModels = ref<string[]>([])
const defaultModel = ref('ir.cron')

onBeforeMount(async () => {
    const models = await rpc.searchRead('ir.model', [], 0, null, [], ['name'])
    availableModels.value = models.map(val => val['name'])
    defaultModel.value = 'ir.cron' // availableModels.value[0] || 'ir.cron'
    model.value = defaultModel.value
})

const methods = ref(['search', 'read', 'write', 'create', 'delete', 'fields_get', 'search_read'])

const model = ref('res.user')
const method = ref('search')
const params = ref('[[], 0, 10, []]')
const context = ref('{}')

const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

async function execute() {
    loading.value = true
    error.value = null
    result.value = null

    try {
        // Parse parameters
        let prms: any[]
        try {
            prms = JSON.parse(params.value)
            if (!Array.isArray(prms)) {
                throw new Error('Parameters must be a JSON array')
            }
        } catch (err) {
            throw new Error(
                `Invalid parameters JSON: ${err instanceof Error ? err.message : 'Unknown error'}`,
            )
        }

        // Parse context
        let ctx: any
        try {
            ctx = JSON.parse(context.value)
            if (typeof ctx !== 'object' || Array.isArray(ctx)) {
                throw new Error('Context must be a JSON object')
            }
        } catch (err) {
            throw new Error(
                `Invalid context JSON: ${err instanceof Error ? err.message : 'Unknown error'}`,
            )
        }

        // Execute RPC call
        const rpcResult = await rpc.execute(model.value, method.value, prms, ctx)

        result.value = rpcResult
    } catch (err) {
        if (err instanceof RpcError) {
            error.value = `RPC Error (${err.code}): ${err.message}`
        } else if (err instanceof TrytonRpcError) {
            error.value = `${err.name}: ${err.message}`
        } else {
            error.value = 'Unknown error'
        }
    } finally {
        loading.value = false
    }
}

function loadExample() {
    const examples: Record<string, { params: string; context: string }> = {
        search: {
            params: '[[], 0, 10, []]',
            context: '{}',
        },
        read: {
            params: '[[1], ["name", "login"]]',
            context: '{}',
        },
        fields_get: {
            params: '[[]]',
            context: '{}',
        },
        search_read: {
            params: '[[], 0, 10, [["name","asc"]], ["name"]]',
            context: '{}',
        },
        write: {
            params: '[[1], {"name": "New Name"}]',
            context: '{}',
        },
        create: {
            params: '[[{"name": "New Record"}]]',
            context: '{}',
        },
        delete: {
            params: '[[1]]',
            context: '{}',
        },
    }

    const example = examples[method.value]
    if (example) {
        params.value = example.params
        context.value = example.context
    }
}

watch(method, loadExample)
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <template #title>RPC Configuration</template>
            <template #content>
                <Fluid>
                    <Select filter v-model="model" :options="availableModels" placeholder="Select model" class="mb-2" />
                    <Select v-model="method" :options="methods" placeholder="Select method" class="mb-2" />
                    <Textarea v-model="params" rows="4" class="mb-2" />
                    <Textarea v-model="context" rows="4" class="mb-2" />
                    <Button label="Execute" icon="pi pi-play" :loading="loading" @click="execute" />
                </Fluid>
            </template>
        </Card>

        <Card>
            <template #title>Response</template>
            <template #content>
                <ErrorMessage :message="error" />
                <LoadingSpinner v-if="loading">Executing RPC…</LoadingSpinner>
                <JsonViewer v-if="result != null" :value="result" />
            </template>
        </Card>
    </div>
</template>
