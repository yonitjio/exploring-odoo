<template>
    <button type="button" class="layout-topbar-action" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        <span>Sign Out</span>
    </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// Assuming you have an authentication store (e.g., authStore from Pinia)
// import { useAuthStore } from '@/stores/authStore';

const router = useRouter()
const auth = useAuthStore() // Uncomment if using a store

const handleLogout = async () => {
    try {
        const layout = localStorage.getItem(NUCLEUS_LAYOUT_STORAGE_KEY)
        localStorage.clear()
        if (layout) localStorage.setItem(NUCLEUS_LAYOUT_STORAGE_KEY, layout)
        await auth.logout()

        await router.push({ name: '/' }) // Use the name of your login route
    } catch {
        localStorage.clear()
        await router.push({ name: '/' })
    }
}
</script>
