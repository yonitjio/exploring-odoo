import { registry } from './service-registry'
import { RpcService } from './rpc-service'
import { SessionService } from './session-service'

let resolveReady!: () => void
let resolved = false

export const appReady = new Promise<void>(resolve => {
    resolveReady = resolve
})

export function markAppReady() {
    if (resolved) return
    resolved = true
    resolveReady()
}

export async function setupServices() {
    registry.register(new RpcService())
    registry.register(new SessionService())

    for (const service of registry.list()) {
        await service.initialize?.()
    }

    markAppReady()
}
