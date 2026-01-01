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
    'org.eclipse.elk.padding': '[top=0,left=0,bottom=0,right=0]',
    'org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
    'org.eclipse.elk.layered.considerModelOrder.strategy': 'PREFER_NODES',
    'elk.portConstraints': 'FIXED_POS',
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
        originalId: '',
        width: 0,
        height: 0,
        children: [],
        edges: [],
        layoutOptions: {
            ...defaultLayoutOptions,
            'elk.direction': 'RIGHT'
        }
    };
    let startId;
    const triggerNode = Array.from(graph.nodes.values()).find(n => n.type.endsWith('TriggerNode'));
    if (triggerNode) {
        startId = triggerNode.id;
    }
    else {
        const startNode = Array.from(graph.nodes.values()).find(n => n.type === 'StartNode');
        if (startNode) {
            startId = startNode.id;
        }
        else {
            throw new GraphError('Graph must have a StartNode or a TriggerNode to determine layout root.');
        }
    }
    const visited = new Set();
    const elkNodes = new Array();
    const edgeCreated = new Set();
    processNode(startId, elkRoot, visited, elkNodes, edgeCreated, graph);
    graph.nodes.forEach(node => {
        if (!visited.has(node.id)) {
            const isAux = Array.from(nodeAuxMap.values()).includes([createIdentifier(node.id)]);
            if (!isAux) {
                processNode(node.id, elkRoot, visited, elkNodes, edgeCreated, graph);
            }
        }
    });
    return elkRoot;
}
function processNode(nodeId, parentElkNode, visited, elkNodes, edgeCreated, graph) {
    if (visited.has(nodeId))
        return;
    visited.add(nodeId);
    const node = graph.nodes.get(nodeId);
    const auxChildrenIds = nodeAuxMap.get(nodeId);
    const outgoingWorkflowEdges = getEdgesByType(node, graph, ["output"]);
    const childredNotVisited = auxChildrenIds ? auxChildrenIds.filter(id => visited.has(id)).length === 0 : true;
    if (auxChildrenIds && auxChildrenIds.length > 0 && childredNotVisited) {
        const groupNode = {
            id: `group-${String(node.id)}`,
            originalId: String(node.id),
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
            }
        };
        groupNode.parent = parentElkNode;
        parentElkNode.children.push(groupNode);
        visited.add(createIdentifier(groupNode.id));
        elkNodes.push(groupNode);
        const elkNode = createSimpleElkNode(node, elkNodes);
        elkNode.parent = groupNode;
        groupNode.children.push(elkNode);
        createElkPorts(node, elkNode, ["aux-input"]);
        createElkPorts(node, groupNode, ["input", "output", "aux-output"]);
        const inputAuxEdges = getEdgesByType(node, graph, ["aux-input"]);
        inputAuxEdges.forEach(edge => {
            if (!edgeCreated.has(edge.id)) {
                groupNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId));
                edgeCreated.add(edge.id);
            }
        });
        auxChildrenIds.forEach(auxId => {
            const auxChildrenNode = graph.nodes.get(auxId);
            let auxChildrenElkNode;
            if (getEdgesByType(auxChildrenNode, graph, ["output"]).length > 0) {
                const subGraphNode = {
                    id: `subgraph-${String(auxChildrenNode.id)}`,
                    originalId: String(auxChildrenNode.id),
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
                    }
                };
                subGraphNode.parent = groupNode;
                groupNode.children.push(subGraphNode);
                visited.add(createIdentifier(subGraphNode.id));
                createElkPorts(auxChildrenNode, subGraphNode, ["aux-input", "aux-output"]);
                processNode(auxId, subGraphNode, visited, elkNodes, edgeCreated, graph);
                auxChildrenElkNode = subGraphNode;
            }
            else {
                visited.add(auxId);
                const auxElkNode = createSimpleElkNode(auxChildrenNode, elkNodes);
                auxElkNode.parent = groupNode;
                groupNode.children.push(auxElkNode);
                createElkPorts(auxChildrenNode, auxElkNode, ["input", "output", "aux-output"]);
                auxChildrenElkNode = auxElkNode;
            }
            if (getEdgesByType(auxChildrenNode, graph, ["aux-input"]).length > 0) {
                createElkPorts(auxChildrenNode, auxChildrenElkNode, ["aux-input"]);
                const inputAuxEdges = getEdgesByType(auxChildrenNode, graph, ["aux-input"]);
                inputAuxEdges.forEach(edge => {
                    if (!edgeCreated.has(edge.id)) {
                        groupNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId));
                        edgeCreated.add(edge.id);
                    }
                });
                const auxChildrenAuxSiblingIds = nodeAuxMap.get(auxId);
                if (!auxChildrenElkNode.children) {
                    auxChildrenElkNode.children = [];
                }
                auxChildrenAuxSiblingIds.forEach(acacId => {
                    processNode(acacId, groupNode, visited, elkNodes, edgeCreated, graph);
                });
            }
        });
    }
    else if (auxChildrenIds && auxChildrenIds.length > 0) {
        const groupNode = {
            id: `group-${String(node.id)}`,
            originalId: String(node.id),
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
            }
        };
        groupNode.parent = parentElkNode;
        parentElkNode.children.push(groupNode);
        const groupId = createIdentifier(groupNode.id);
        visited.add(groupId);
        elkNodes.push(groupNode);
        const elkNode = createSimpleElkNode(node, elkNodes);
        elkNode.parent = groupNode;
        groupNode.children.push(elkNode);
        createElkPorts(node, elkNode, ["aux-input"]);
        createElkPorts(node, groupNode, ["input", "output", "aux-output"]);
        const inputAuxEdges = getEdgesByType(node, graph, ["aux-input"]);
        inputAuxEdges.forEach(edge => {
            if (!edgeCreated.has(edge.id)) {
                groupNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId));
                edgeCreated.add(edge.id);
            }
        });
        const childNodes = elkNodes.filter(n => (auxChildrenIds.includes(createIdentifier(n.originalId)) && n.id.startsWith("group-")) ||
            (auxChildrenIds.includes(createIdentifier(n.id)) && elkNodes.findIndex(o => o.id === `group-${String(n.id)}`) < 0));
        if (childNodes.length > 0) {
            childNodes.forEach(n => {
                if (n.id === groupNode.id) {
                    return;
                }
                if (n.parent) {
                    const idxInParent = n.parent.children.indexOf(n);
                    n.parent.children.splice(idxInParent, 1);
                }
                groupNode.children.push(n);
                n.parent = groupNode;
                const workflowPorts = n.ports.filter(v => ["WEST", "EAST"].includes(v.layoutOptions['port.side']));
                workflowPorts.forEach(p => {
                    groupNode.ports.push(p);
                });
                n.ports = n.ports.filter(v => ["NORTH", "SOUTH"].includes(v.layoutOptions['port.side']));
                if (n.id.startsWith("group")) {
                    n.layoutOptions["elk.portConstraints"] = "FIXED_SIDE";
                }
            });
        }
    }
    else {
        const simpleNode = createSimpleElkNode(node, elkNodes);
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
        if (!edgeCreated.has(edge.id)) {
            parentElkNode.edges.push(createElkEdge(edge.id, edge.fromPortId, edge.toPortId));
            edgeCreated.add(edge.id);
            const nextNodeId = portToNodeIndex.get(edge.toPortId);
            if (nextNodeId) {
                processNode(nextNodeId, parentElkNode, visited, elkNodes, edgeCreated, graph);
            }
        }
    });
}
function createSimpleElkNode(node, elkNodes) {
    const res = {
        id: String(node.id),
        originalId: '',
        labels: [{
                text: `${String(node.type)}`,
            }],
        layoutOptions: {
            ...defaultLayoutOptions,
        },
        width: node.size?.width,
        height: node.size?.height,
        ports: [],
    };
    elkNodes.push(res);
    return res;
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
