import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuthGuard() {
    const router = useRouter()
    const authStore = useAuthStore()

    onMounted(async () => {
        const isValid = await authStore.checkSession()
        if (!isValid) {
            await router.push('/login')
        }
    })

    async function handleLogout() {
        await authStore.logout()
        await router.push('/login')
    }

    return { authStore, handleLogout }
}
