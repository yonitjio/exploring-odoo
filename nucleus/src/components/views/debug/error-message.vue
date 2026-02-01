<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

<template>
    <Message v-if="message" severity="error">
        {{ message }}
    </Message>
</template>
