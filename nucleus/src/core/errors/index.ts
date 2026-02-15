/*
* SPDX-License-Identifier: GPL-3.0-or-later
*/

export class NucleusError extends Error {
    constructor(
        message: string,
        public readonly code?: string | number,
        public readonly data?: any,
    ) {
        super(message)
        this.name = String(code)
    }
}

export class RpcError extends NucleusError {}
export class TrytonRpcError extends NucleusError {}
export class FieldError extends NucleusError {}
export class FieldTypeError extends FieldError {}
export class ModelError extends NucleusError {}
export class ViewError extends NucleusError {}

export class ValidationError extends NucleusError {
    constructor(field: string, message: string) {
        super(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR')
    }
}
