import { ref } from 'vue'
import { registry } from '@/core/services'
import type { SessionService } from '@/core/services/session-service'
import type { RpcService } from '@/core/services/rpc-service'

export function useSessionGuard() {
    const sessionReady = ref(false)
    const sessionError = ref<Error | null>(null)

    async function ensureSession(): Promise<boolean> {
        if (sessionReady.value) return true

        try {
            const session = registry.get<SessionService>('sessionService')
            const rpc = registry.get<RpcService>('rpcService')

            await Promise.all([
                session.ensureInitialized(),
                rpc.ensureInitialized()
            ])

            sessionReady.value = true
            sessionError.value = null
            return true
        } catch (err) {
            sessionError.value = err instanceof Error ? err : new Error('Session initialization failed')
            sessionReady.value = false
            return false
        }
    }

    return {
        sessionReady,
        sessionError,
        ensureSession
    }
}
