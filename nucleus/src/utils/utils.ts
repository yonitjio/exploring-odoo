export function utoa(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

export function toTitleCase(str: string | null | undefined): string {
    if (!str) return ''
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
}

export const toProperCase = toTitleCase

export function isNumber(value: number): boolean {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
}

export function parseNumeric(val: string | null | undefined): number {
    const parsed = Number(val);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export function format_size(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}


export function guess_mime_type(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()

    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        bmp: 'image/bmp',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
    }

    return mimeTypes[ext || ''] || 'image/png'
}

export function hasSlotContent(slot: Slot | undefined, slotProps = {}): boolean {
    if (!slot) return false;

    const res: boolean = slot(slotProps).some((vnode: VNode) => {
        if (vnode.type === Comment) return false;

        if (Array.isArray(vnode.children) && !vnode.children.length) return false;

        if (typeof vnode.children === 'string' && vnode.children.trim() === 'v-if') {
            return false
        }

        if (vnode.type !== Text && typeof vnode.children === 'string' && vnode.children.trim() === '') {
            return false
        }

        return true;
    });

    return res
}

export function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
    return obj[key];
}

export function makePromise(value?: any) {
    return new Promise<any>((resolve) => {
        resolve(value)
    })
}

export function isEmpty(value: unknown): boolean {
    return value != null && typeof value === 'object' && Object.keys(value).length === 0;
};

export function getDistinctPropertyValues<T>(array: T[], propertyName: keyof T): T[keyof T][] {
    const allValues = array.map(item => item[propertyName]);
    const uniqueValues = new Set(allValues);

    return [...uniqueValues];
}
