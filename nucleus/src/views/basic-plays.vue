<script setup lang="ts">
import { ref } from 'vue'

import { useAuthGuard } from '@/composables/useAuthGuard'

useAuthGuard()

const activeTab = ref('0')
</script>

<template>
    <AppLayout>
        <Card>
            <template #content>
                <Tabs v-model:value="activeTab">
                    <TabList>
                        <Tab value="0">Rpc Tester</Tab>
                        <Tab value="1">Model Inspector</Tab>
                        <Tab value="2">View Inspector</Tab>
                        <Tab value="3">Record Browser</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0"><RpcPlay /></TabPanel>
                        <TabPanel value="1"><ModelPlay /></TabPanel>
                        <TabPanel value="2"><ViewPlay /></TabPanel>
                        <TabPanel value="3"><RecordPlay /></TabPanel>
                    </TabPanels>
                </Tabs>
            </template>
        </Card>
    </AppLayout>
</template>
