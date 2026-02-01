<script setup lang="ts">
import { useAuthGuard } from '@/composables/useAuthGuard'

useAuthGuard()
</script>

<template>
    <AppLayout>
        <div class="w-full p-8 text-center">
            <LogoIcon :width="128" :height="128" class="inline-block mb-4" />
            <h1 class="text-2xl font-semibold mb-4 text-[var(--p-text-color)]">
                Welcome to Nucleus!
            </h1>
        </div>
    </AppLayout>
</template>
