<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    value: any
    language?: 'json' | 'xml'
}>()

const valueString = ref('')

watchEffect(() => {
    if (props.language === 'xml') {
        valueString.value = props.value
    } else {
        valueString.value = JSON.stringify(props.value, null, 2)
    }
})
</script>

<template>
    <pre class="p-4 rounded text-sm overflow-auto">{{ valueString }}</pre>
</template>
