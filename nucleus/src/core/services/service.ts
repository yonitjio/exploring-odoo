export interface IService {
    readonly name: string
    initialize?(): Promise<void>
    destroy?(): Promise<void>
}

