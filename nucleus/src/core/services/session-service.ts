import type { IService } from './service'

export type TContext = Record<string, any>

export class SessionService implements IService {
    readonly name = 'sessionService'
    context: TContext = {}
    _initialized = false
    _initPromise: Promise<void> | null = null

    async initialize(): Promise<void> {
        if (this._initialized) return
        if (this._initPromise) return this._initPromise

        this._initPromise = this._doInitialize()
        return this._initPromise
    }

    async _doInitialize(): Promise<void> {
        // Wait for Pinia hydration
        await new Promise((resolve) => setTimeout(resolve, 0))

        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()

        if (authStore.sessionData?.context) {
            this.context = authStore.sessionData.context
        }

        this._initialized = true
    }

    async ensureInitialized(): Promise<void> {
        if (!this._initialized) {
            await this.initialize()
        }
    }

    get isInitialized(): boolean {
        return this._initialized
    }

    setContext(context: TContext): void {
        this.context = { ...context }
    }

    getContext(): TContext {
        return { ...this.context }
    }

    mergeContext(additionalContext: TContext): TContext {
        return { ...this.context, ...additionalContext }
    }

    clearContext(): void {
        this.context = {}
    }

    getValue(key: string, defaultValue?: any): any {
        return this.context[key] ?? defaultValue
    }

    setValue(key: string, value: any): void {
        this.context[key] = value
    }

    removeValue(key: string): void {
        delete this.context[key]
    }

    hasValue(key: string): boolean {
        return key in this.context
    }
}
