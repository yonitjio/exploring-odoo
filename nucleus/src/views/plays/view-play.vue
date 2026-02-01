<script setup lang="ts">
import { ref } from 'vue'
import { registry } from '@/core/services'
import { RpcService } from '@/core/services/rpc-service'
import { XMLParser } from 'fast-xml-parser'
import { RpcError } from '@/core/errors'

const rpc = registry.get<RpcService>('rpcService')

const viewId = ref('')

const view = ref<any>(null)
const parsedView = ref<any>(null)

const loading = ref(false)
const error = ref<string | null>(null)

async function inspect() {
    if (!viewId.value) return

    loading.value = true
    error.value = null
    view.value = null
    parsedView.value = null

    try {
        const vId = parseInt(viewId.value)
        if (isNaN(vId)) {
            throw new Error('View ID must be a number')
        }

        const result = await rpc.execute(
            'ir.ui.view',
            'read',
            [[vId], ['model', 'type', 'name', 'arch']],
            {},
        )

        if (!result || result.length === 0) {
            throw new Error('View not found')
        }

        view.value = result[0]

        // Parse XML
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_',
                textNodeName: '#text',
                parseTagValue: false,
                parseAttributeValue: false,
            })
            parsedView.value = parser.parse(view.value.arch)
        } catch (err) {
            console.error('XML parsing error:', err)
            parsedView.value = { error: 'Failed to parse XML' }
        }
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
</script>

<template>
    <Card>
        <template #title>View Inspector</template>
        <template #content>
            <div class="flex gap-2 mb-4">
                <InputText v-model="viewId" placeholder="View ID" />
                <Button label="Inspect" @click="inspect" :disabled="!viewId" />
            </div>

            <ErrorMessage :message="error" />
            <LoadingSpinner v-if="loading">Loading view…</LoadingSpinner>

            <div v-if="view" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <JsonViewer :value="view.arch" language="xml" />
                <JsonViewer :value="parsedView" />
            </div>
        </template>
    </Card>
</template>
