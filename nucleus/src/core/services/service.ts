/*
* SPDX-License-Identifier: GPL-3.0-or-later
*/

export interface IService {
    readonly name: string
    initialize?(): Promise<void>
    destroy?(): Promise<void>
}

