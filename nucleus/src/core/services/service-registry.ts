/*
* SPDX-License-Identifier: GPL-3.0-or-later
*/

import type { IService } from './service'

export class ServiceRegistry {
    _services = new Map<string, IService>()

    register<T extends IService>(service: T): T {
        if (this._services.has(service.name)) {
            throw new Error(`Service ${service.name} already registered`)
        }
        this._services.set(service.name, service)
        return service
    }

    get<T extends IService>(name: string): T {
        const service = this._services.get(name)
        if (!service) {
            throw new Error(`Service ${name} not found`)
        }
        return service as T
    }

    list(): IService[] {
        return [...this._services.values()]
    }
}

export const registry = new ServiceRegistry()
