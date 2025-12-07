/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */
import { createIdentifier } from "@n2_ui/utils/types";
import { GraphError } from "@n2_ui/utils/utils";
let nodeAuxMap;
let portToNodeIndex;
const defaultLayoutOptions = {
    'elk.algorithm': 'layered',
    'org.eclipse.elk.alignment': 'LEFT',
    'org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
};
export function convertToElk(graph) {
    nodeAuxMap = new Map();
    const auxEdges = Array.from(graph.edges.values()).filter(edge => {
        const toPort = findPort(edge.toPortId, graph);
        return toPort?.type === "aux-input";
    });
    portToNodeIndex = new Map([...graph.portToNodeIndex]);
    auxEdges.forEach(edge => {
        const fromNodeId = portToNodeIndex.get(edge.fromPortId);
        const toNodeId = portToNodeIndex.get(edge.toPortId);
        if (!nodeAuxMap.has(toNodeId)) {
            nodeAuxMap.set(toNodeId, []);
        }
        nodeAuxMap.get(toNodeId).push(fromNodeId);
    });
    const elkRoot = {
        id: 'root',
        width: 0,
        height: 0,
        children: [],
        edges: [],
        layoutOptions: {
            ...defaultLayoutOptions,
            'elk.direction': 'RIGHT'
        }
    };
    const startNode = Array.from(graph.nodes.values()).find(n => n.type === 'StartNode');
    if (!startNode) {
        throw new GraphError('Graph must have a "StartNode" to determine layout root.');
    }
    const visited = new Set();
    processNode(startNode.id, elkRoot, visited, graph);
    graph.nodes.forEach(node => {
        if (!visited.has(node.id)) {
            const isAux = Array.from(nodeAuxMap.values()).includes([createIdentifier(node.id)]);
            if (!isAux) {
                processNode(node.id, elkRoot, visited, graph);
            }
        }
    });
    return elkRoot;
}
function processNode(nodeId, parentElkNode, visited, graph) {
    if (visited.has(nodeId))
        return;
    visited.add(nodeId);
    const node = graph.nodes.get(nodeId);
    const auxChildrenIds = nodeAuxMap.get(nodeId);
    const outgoingWorkflowEdges = getEdgesByType(node, graph, ["output"]);
    if (auxChildrenIds && auxChildrenIds.length > 0) {
        const groupNode = {
            id: `group-${String(node.id)}`,
            labels: [{
                    text: `group-${String(node.type)}`,
                }],
            width: 0, height: 0,
            children: [],
            ports: [],
            edges: [],
            layoutOptions: {
                ...defaultLayoutOptions,
                'elk.direction': 'UP',
                'elk.portConstraints': 'FIXED_POS',
                'org.eclipse.elk.padding': '[top=0,left=0,bottom=0,right=0]',
            }
        };
        groupNode.parent = parentElkNode,
            parentElkNode.children.push(groupNode);
        const elkNode = createSimpleElkNode(node);
        elkNode.parent = groupNode;
        groupNode.children.push(elkNode);
        createElkPorts(node, elkNode, ["aux-input"]);
        createElkPorts(node, groupNode, ["input", "output"]);
        const inputAuxEdges = getEdgesByType(node, graph, ["aux-input"]);
        inputAuxEdges.forEach(edge => groupNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId)));
        auxChildrenIds.forEach(auxId => {
            const auxChildrenNode = graph.nodes.get(auxId);
            let auxChildrenElkNode;
            if (getEdgesByType(auxChildrenNode, graph, ["output"]).length > 0) {
                const subGraphNode = {
                    id: `subgraph-${String(auxChildrenNode.id)}`,
                    labels: [{
                            text: `subgraph-${String(auxChildrenNode.type)}`,
                        }],
                    children: [],
                    ports: [],
                    edges: [],
                    width: 0,
                    height: 0,
                    layoutOptions: {
                        ...defaultLayoutOptions,
                        'elk.direction': 'RIGHT',
                        'elk.portConstraints': 'FIXED_POS',
                        'org.eclipse.elk.padding': '[top=0,left=0,bottom=0,right=0]',
                    }
                };
                subGraphNode.parent = groupNode;
                groupNode.children.push(subGraphNode);
                createElkPorts(auxChildrenNode, subGraphNode, ["aux-input", "aux-output"]);
                processNode(auxId, subGraphNode, visited, graph);
                auxChildrenElkNode = subGraphNode;
            }
            else {
                visited.add(auxId);
                const auxElkNode = createSimpleElkNode(auxChildrenNode);
                auxElkNode.parent = groupNode;
                groupNode.children.push(auxElkNode);
                createElkPorts(auxChildrenNode, auxElkNode, ["input", "output", "aux-output"]);
                auxChildrenElkNode = auxElkNode;
            }
            if (getEdgesByType(auxChildrenNode, graph, ["aux-input"]).length > 0) {
                createElkPorts(auxChildrenNode, auxChildrenElkNode, ["aux-input"]);
                const inputAuxEdges = getEdgesByType(auxChildrenNode, graph, ["aux-input"]);
                inputAuxEdges.forEach(edge => groupNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId)));
                const auxChildrenAuxSiblingIds = nodeAuxMap.get(auxId);
                if (!auxChildrenElkNode.children) {
                    auxChildrenElkNode.children = [];
                }
                auxChildrenAuxSiblingIds.forEach(acacId => {
                    processNode(acacId, groupNode, visited, graph);
                });
            }
        });
    }
    else {
        const simpleNode = createSimpleElkNode(node);
        simpleNode.parent = parentElkNode;
        parentElkNode.children.push(simpleNode);
        if ((parentElkNode.id.startsWith("subgraph") && (parentElkNode.children?.length > 0) && (parentElkNode.children[0].id === node.id))) {
            createElkPorts(node, simpleNode, ["input", "output"]);
        }
        else {
            createElkPorts(node, simpleNode);
        }
    }
    outgoingWorkflowEdges.forEach(edge => {
        parentElkNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId));
        const nextNodeId = portToNodeIndex.get(edge.toPortId);
        if (nextNodeId) {
            processNode(nextNodeId, parentElkNode, visited, graph);
        }
    });
}
function createSimpleElkNode(node) {
    return {
        id: String(node.id),
        labels: [{
                text: `${String(node.type)}`,
            }],
        layoutOptions: {
            ...defaultLayoutOptions,
            'elk.portConstraints': 'FIXED_POS',
        },
        width: node.size?.width,
        height: node.size?.height,
        ports: [],
    };
}
function createElkEdge(id, fromId, toId) {
    return {
        id: String(id),
        sources: [String(fromId)],
        targets: [String(toId)],
    };
}
function createElkPorts(node, targetElkNode, types) {
    const portsToCreate = types ? node.ports.filter(p => types.includes(p.type)) : node.ports;
    portsToCreate.forEach(port => {
        targetElkNode.ports.push({
            id: String(port.id),
            width: 10, height: 10,
            x: port.position.x, y: port.position.y,
            layoutOptions: {
                'port.side': getPortSide(port.type)
            }
        });
    });
}
function getPortSide(type) {
    switch (type) {
        case "input": return 'WEST';
        case "output": return 'EAST';
        case "aux-input": return 'SOUTH';
        case "aux-output": return 'NORTH';
        default: return 'WEST';
    }
}
function getEdgesByType(node, graph, fromPortTypes) {
    const portIds = new Set(node.ports.filter(p => fromPortTypes.includes(p.type)).map(p => p.id));
    return Array.from(graph.edges.values()).filter(e => portIds.has(e.fromPortId) || portIds.has(e.toPortId));
}
function findPort(portId, graph) {
    for (const node of Array.from(graph.nodes.values())) {
        const port = node.ports.find(p => p.id === portId);
        if (port)
            return port;
    }
    return undefined;
}
function getTruePos(node) {
    const myPos = { x: node.x, y: node.y };
    if (node.parent) {
        const offset = getTruePos(node.parent);
        myPos.x += offset.x;
        myPos.y += offset.y;
    }
    return myPos;
}
export function applyLayout(graph, controller, elkjsNode, offset) {
    const node = graph.nodes.get(createIdentifier(elkjsNode.id));
    if (node) {
        const truePos = getTruePos(elkjsNode);
        truePos.x += offset.xOffset;
        truePos.y += offset.yOffset;
        controller.setNodePosition(node.id, truePos.x, truePos.y);
    }
    if (elkjsNode.children) {
        for (const child of elkjsNode.children) {
            applyLayout(graph, controller, child, offset);
        }
    }
}
export function calculateCenteringOffset(graphPos, viewportPos) {
    const graphWidth = graphPos.width / 2;
    const viewportWidth = viewportPos.width / 2;
    const graphHeight = graphPos.height / 2;
    const viewportHeight = viewportPos.height / 2;
    return {
        xOffset: viewportWidth - graphWidth > 0 ? viewportWidth - graphWidth : 0,
        yOffset: viewportHeight - graphHeight > 0 ? viewportHeight - graphHeight : 0,
    };
}
