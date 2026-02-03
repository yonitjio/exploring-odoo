import { parseAttributes } from '@/utils/attributes'
import type { TViewDefinition } from '../services/view-registry'
import { XMLParser } from 'fast-xml-parser'

export interface ParsedViewNode {
    id: string
    tag: string
    attrs: Record<string, any>
    children: ParsedViewNode[]
    text?: string
}

export interface ParsedView {
    id: string
    type: string
    root: ParsedViewNode
    fields: Record<string, any>
}

/**
 * XML View Parser
 * Parses Tryton XML view definitions into a structured tree
 */
export class XMLViewParser {
    _parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        textNodeName: '#text',
        preserveOrder: true,
        trimValues: true,
    })

    /**
     * Parse a view definition into a structured tree
     */
    parse(view: TViewDefinition): ParsedView {
        let parsed: any[]

        try {
            parsed = this._parser.parse(view.arch)
        } catch (err: any) {
            throw new Error(`XML parsing error: ${err.message}`)
        }

        if (!parsed.length || !parsed[0]) {
            throw new Error('XML parsing error: empty document')
        }

        const rootNode = this._parseNode(parsed[0])
        const id = crypto.randomUUID()

        return {
            id: id,
            type: view.type,
            root: rootNode,
            fields: view.fields || {},
        }
    }

    /**
     * Convert fast-xml-parser node into ParsedViewNode
     */
    _parseNode(node: any): ParsedViewNode {
        const tag = Object.keys(node).find((k) => k !== ':@' && k !== '#text')
        if (!tag) {
            throw new Error('Invalid XML structure')
        }

        const element = node[tag]
        const attrs = parseAttributes(node[':@'] || {})

        const id = crypto.randomUUID()
        const parsedNode: ParsedViewNode = {
            id: id,
            tag: tag.toLowerCase(),
            attrs,
            children: [],
        }

        // Handle text content
        if (typeof element === 'string') {
            parsedNode.text = element
            return parsedNode
        }

        if (Array.isArray(element)) {
            for (const child of element) {
                if (child['#text']) {
                    parsedNode.text = child['#text']
                } else {
                    parsedNode.children.push(this._parseNode(child))
                }
            }
        }

        return parsedNode
    }

    /**
     * Find all nodes with a specific tag
     */
    static findNodes(node: ParsedViewNode, tag: string): ParsedViewNode[] {
        const results: ParsedViewNode[] = []

        if (node.tag === tag) {
            results.push(node)
        }

        for (const child of node.children) {
            results.push(...XMLViewParser.findNodes(child, tag))
        }

        return results
    }

    /**
     * Find first node with specific tag
     */
    static findNode(node: ParsedViewNode, tag: string): ParsedViewNode | null {
        if (node.tag === tag) {
            return node
        }

        for (const child of node.children) {
            const found = XMLViewParser.findNode(child, tag)
            if (found) return found
        }

        return null
    }

    /**
     * Get all field nodes from a view
     */
    static getFieldNodes(root: ParsedViewNode): ParsedViewNode[] {
        return XMLViewParser.findNodes(root, 'field')
    }

    /**
     * Get field names referenced in the view
     */
    static getFieldNames(root: ParsedViewNode): string[] {
        return XMLViewParser.getFieldNodes(root)
            .map((node) => node.attrs.name)
            .filter((name): name is string => typeof name === 'string')
    }

    // Helper methods for parsed view
    static getFieldDomain(node: ParsedViewNode): any[] | null {
        return node.attrs.domain || null
    }

    static getFieldContext(node: ParsedViewNode): Record<string, any> | null {
        return node.attrs.context || null
    }

    static getFieldStates(node: ParsedViewNode): Record<string, any> | null {
        return node.attrs.states || null
    }
}
