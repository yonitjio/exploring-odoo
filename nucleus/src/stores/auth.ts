import { defineStore } from 'pinia'

import { registry } from '@/core/services/service-registry'
import { RpcService } from '@/core/services/rpc-service'
import type { SessionData } from '@/core/services/rpc-service'
import { utoa } from '@/utils/utils'
import { SessionService } from '@/core/services/session-service'
import { RpcError } from '@/core/errors'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        sessionData: null as SessionData | null,
        isAuthenticated: false,
        isLoading: false,
        error: null as string | null,
    }),

    getters: {
        userId: (state) => state.sessionData?.userId,
        username: (state) => state.sessionData?.username,
        database: (state) => state.sessionData?.database,
        sessionId: (state) => state.sessionData?.sessionId,
    },

    actions: {
        async login(database: string, username: string, password: string) {
            const rpc = registry.get<RpcService>('rpcService')
            const session = registry.get<SessionService>('sessionService')

            this.isLoading = true
            this.error = null

            try {
                const result = await rpc.login(database, username, password)

                this.sessionData = {
                    sessionId: result[1],
                    userId: result[0],
                    username: username,
                    database,
                    context: {},
                    auth: utoa(`${username}:${result[0]}:${result[1]}`),
                }

                this.isAuthenticated = true
                rpc.setSessionData(this.sessionData)

                // Get user context
                try {
                    const userContext = await rpc.execute('res.user', 'get_preferences', [true])
                    this.sessionData.context = userContext
                    session.setContext(userContext)
                } catch (err) {
                    console.warn('Failed to load user preferences:', err)
                }

                return true
            } catch (err) {
                if (err instanceof RpcError) {
                    if (err.code == 401) {
                        this.error = 'Login failed'
                    } else {
                        this.error = err.message
                    }
                } else {
                    this.error = 'Login failed'
                }
                this.isAuthenticated = false
                return false
            } finally {
                this.isLoading = false
            }
        },

        async logout() {
            const rpc = registry.get<RpcService>('rpcService')
            const session = registry.get<SessionService>('sessionService')

            try {
                await rpc.logout()
            } catch (err) {
                console.warn('Logout error:', err)
            } finally {
                this.sessionData = null
                this.isAuthenticated = false
                this.error = null
                rpc.setSessionData(null)
                session.clearContext()
            }
        },

        async checkSession() {
            const rpc = registry.get<RpcService>('rpcService')
            const session = registry.get<SessionService>('sessionService')

            if (!this.sessionData?.sessionId || !this.sessionData?.database) {
                this.isAuthenticated = false
                return false
            }

            try {
                // Try a simple call to verify session is still valid
                rpc.setSessionData(this.sessionData)
                session.setContext(this.sessionData.context)

                await rpc.execute('res.user', 'read', [[this.sessionData.userId], ['name']])
                this.isAuthenticated = true
                return true
            } catch {
                // Session is invalid
                this.sessionData = null
                this.isAuthenticated = false
                rpc.setSessionData(null)
                session.clearContext()
                return false
            }
        },

        clearError() {
            this.error = null
        },
    },

    persist: {
        key: 'nucleus-auth',
        pick: ['sessionData', 'isAuthenticated'],
    },
})
