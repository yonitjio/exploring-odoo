<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { useAuthGuard } from '@/composables/useAuthGuard'

useAuthGuard()
</script>

<template>
    <AppLayout>
        <p class="text-h6 mt-4 text-medium-emphasis">Loading Nucleus...</p>
    </AppLayout>
</template>
