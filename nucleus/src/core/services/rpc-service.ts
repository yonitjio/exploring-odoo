import { RpcError, TrytonRpcError } from '../errors'
import type { IService } from './service'
import type { TContext } from './session-service'

/**
 * JSON-RPC request structure
 */
interface JsonRpcRequest {
    method: string
    params: any[]
    id?: number
}

/**
 * JSON-RPC response structure
 */
interface JsonRpcResponse<T = any> {
    result?: T
    error?: JsonRpcError
    id: number
}

/**
 * JSON-RPC error format (Tryton style: [code, message, data])
 */
interface JsonRpcError extends Array<any> {
    0: string // error type
    1: string // error message
    2: string // error data
}

/**
 * Login response format: [user_id, session_token, ...]
 */
interface LoginResponse extends Array<any> {
    0: number // user_id
    1: string // session token
    2?: any // unused
}

/**
 * Session data structure
 */
interface SessionData {
    sessionId: string
    userId: number
    username: string
    database: string
    context: TContext
    auth: string // base64 encoded auth header
}


/**
 * RPC Service - handles all communication with Tryton server
 */
export class RpcService implements IService {
    readonly name = 'rpcService'
    requestId = 0
    sessionData: SessionData | null = null
    _initialized = false
    _initPromise: Promise<void> | null = null

    async initialize(): Promise<void> {
        if (this._initialized) return
        if (this._initPromise) return this._initPromise

        this._initPromise = this._doInitialize()
        return this._initPromise
    }

    async _doInitialize(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0))

        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()

        if (authStore.sessionData) {
            this.sessionData = authStore.sessionData
        }

        this._initialized = true
    }

    async ensureInitialized(): Promise<void> {
        if (!this._initialized) {
            await this.initialize()
        }
    }

    /**
     * Set current session data
     */
    setSessionData(sessionData: SessionData | null = null): void {
        this.sessionData = sessionData
    }

    isLoggedIn() {
        return Boolean(this.sessionData)
    }

    /**
     * Get URL for RPC calls
     */
    _getUrl(database: string | null = null): string {
        if (this.sessionData?.database) {
            return `/api/${this.sessionData.database}/`
        } else if (database) {
            return `/api/${database}/`
        }
        return `/api/`
    }

    /**
     * Make a JSON-RPC call
     */
    async _call<T>(
        method: string,
        params: any[],
        database: string | null = null,
    ): Promise<T> {
        const request: JsonRpcRequest = {
            method,
            params,
            id: ++this.requestId,
        }

        try {
            let authHeader = {}
            if (this.sessionData?.auth) {
                authHeader = {
                    Authorization: 'Session ' + this.sessionData.auth,
                }
            }

            const headers = Object.assign({ 'Content-Type': 'application/json' }, authHeader)
            const url = database ? this._getUrl(database) : this._getUrl()

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                throw new RpcError(
                    `HTTP error ${response.status}: ${response.statusText}`,
                    response.status,
                )
            }

            const data: JsonRpcResponse<T> = await response.json()

            if (data.error) {
                const error = data.error
                if (error[0] === 'UserWarning') {
                    throw new TrytonRpcError(error[1], 'Warning', data.error)
                } else if (error[0] === 'UserError') {
                    throw new TrytonRpcError(error[1], 'User Error', data.error)
                } else if (error[0] === 'ConcurrencyException') {
                    throw new TrytonRpcError(error[1], 'Concurrency Exception', data.error)
                } else {
                    throw new TrytonRpcError(error[0], 'Error', data.error)
                }
            }

            return data.result as T
        } catch (error) {
            if (error instanceof RpcError || error instanceof TrytonRpcError) {
                throw error
            }
            throw new RpcError(error instanceof Error ? error.message : 'Unknown error', -1)
        }
    }

    /**
     * List available databases
     */
    async listDatabases(): Promise<string[]> {
        const result = await this._call<unknown>('common.db.list', [])
        return Array.isArray(result) ? result : []
    }

    /**
     * Login to database
     */
    async login(database: string, username: string, password: string): Promise<LoginResponse> {
        const result = await this._call<LoginResponse>(
            'common.db.login',
            [
                username,
                {
                    password: password,
                },
                'en',
            ],
            database,
        )

        return result
    }

    /**
     * Logout from current session
     */
    async logout(): Promise<void> {
        if (this.sessionData) {
            try {
                await this._call('common.db.logout', [])
            } finally {
                this.sessionData = null
            }
        }
    }

    /**
     * Execute a model method
     */
    async execute(
        model: string,
        method: string,
        args: any[] = [],
        context: TContext = {},
    ): Promise<any> {
        await this.ensureInitialized()
        return await this._call('model.' + model + '.' + method, [...args, context])
    }

    /**
     * Search for record IDs
     */
    async search(
        model: string,
        domain: any[] = [],
        offset: number = 0,
        limit: number | null = null,
        order: any[] = [],
        context: TContext = {},
    ): Promise<number[]> {
        return await this.execute(model, 'search', [domain, offset, limit, order], context)
    }

    /**
     * Read records
     */
    async read(
        model: string,
        ids: number[],
        fields: string[] = [],
        context: TContext = {},
    ): Promise<any[]> {
        return await this.execute(model, 'read', [ids, fields], context)
    }

    /**
     * Write (update) records
     */
    async write(
        model: string,
        ids: number[],
        values: Record<string, any>,
        context: TContext = {},
    ): Promise<void> {
        return await this.execute(model, 'write', [ids, values], context)
    }

    /**
     * Create records
     */
    async create(
        model: string,
        values: Record<string, any>[],
        context: TContext = {},
    ): Promise<number[]> {
        return await this.execute(model, 'create', [values], context)
    }

    /**
     * Delete records
     */
    async delete(model: string, ids: number[], context: TContext = {}): Promise<void> {
        return await this.execute(model, 'delete', [ids], context)
    }

    /**
     * Get field definitions
     */
    async fieldsGet(
        model: string,
        fields: string[] = [],
        context: TContext = {},
    ): Promise<Record<string, any>> {
        return await this.execute(model, 'fields_get', [fields], context)
    }

    /**
     * Search and read in one call
     */
    async searchRead(
        model: string,
        domain: any[] = [],
        offset = 0,
        limit: number | null = null,
        order: any[] = [],
        fields: string[] = [],
        context: TContext = {},
    ): Promise<any[]> {
        return await this.execute(
            model,
            'search_read',
            [domain, offset, limit, order, fields],
            context,
        )
    }

    /**
     * Get count of records matching domain
     */
    async searchCount(model: string, domain: any[] = [], context: TContext = {}): Promise<number> {
        return await this.execute(model, 'search_count', [domain], context)
    }

    /**
     * Copy a record
     */
    async copy(
        model: string,
        id: number,
        defaults: Record<string, any> = {},
        context: TContext = {},
    ): Promise<number> {
        const [newId] = await this.execute(model, 'copy', [[id], defaults], context)
        return newId
    }

    /**
     * Get default values for new record
     */
    async defaultGet(
        model: string,
        fields: string[] = [],
        context: TContext = {},
    ): Promise<Record<string, any>> {
        return await this.execute(model, 'default_get', [fields], context)
    }
}

export type { JsonRpcRequest, JsonRpcResponse, JsonRpcError, LoginResponse, SessionData, TContext }
