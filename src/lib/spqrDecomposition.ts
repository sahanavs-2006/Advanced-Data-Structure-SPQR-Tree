import { Graph, Node, Edge, SPQRTree, SPQRNode } from '@/types/graph';
import { findBridges } from './graphAnalysis';

/**
 * SPQR Tree Decomposition
 * 
 * S-nodes: Series components (path-like, single unavoidable route)
 * P-nodes: Parallel components (multiple redundant paths between same endpoints)
 * R-nodes: Rigid components (triconnected, complex structure)
 * Q-nodes: Trivial (single edge) - we simplify by not using Q separately
 */

interface BiconnectedComponent {
  nodes: Set<string>;
  edges: Edge[];
}

// Find biconnected components using Tarjan's algorithm
function findBiconnectedComponents(graph: Graph, disabledEdges: Set<string> = new Set()): BiconnectedComponent[] {
  const activeEdges = graph.edges.filter(e => !disabledEdges.has(e.id));
  const n = graph.nodes.length;
  if (n === 0) return [];

  const nodeIndex = new Map<string, number>();
  graph.nodes.forEach((node, i) => nodeIndex.set(node.id, i));

  const adj: { neighbor: number; edgeId: string }[][] = Array.from({ length: n }, () => []);
  const edgeMap = new Map<string, Edge>();

  activeEdges.forEach(edge => {
    const u = nodeIndex.get(edge.source);
    const v = nodeIndex.get(edge.target);
    if (u !== undefined && v !== undefined) {
      adj[u].push({ neighbor: v, edgeId: edge.id });
      adj[v].push({ neighbor: u, edgeId: edge.id });
      edgeMap.set(edge.id, edge);
    }
  });

  const visited = new Array(n).fill(false);
  const disc = new Array(n).fill(0);
  const low = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  let time = 0;

  const edgeStack: { u: number; v: number; edgeId: string }[] = [];
  const components: BiconnectedComponent[] = [];

  function dfs(u: number) {
    visited[u] = true;
    disc[u] = low[u] = ++time;
    let children = 0;

    for (const { neighbor: v, edgeId } of adj[u]) {
      if (!visited[v]) {
        children++;
        parent[v] = u;
        edgeStack.push({ u, v, edgeId });
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        // Check if u is articulation point
        if ((parent[u] === -1 && children > 1) || (parent[u] !== -1 && low[v] >= disc[u])) {
          const component: BiconnectedComponent = { nodes: new Set(), edges: [] };
          while (edgeStack.length > 0) {
            const edge = edgeStack.pop()!;
            component.nodes.add(graph.nodes[edge.u].id);
            component.nodes.add(graph.nodes[edge.v].id);
            const realEdge = edgeMap.get(edge.edgeId);
            if (realEdge) component.edges.push(realEdge);
            if (edge.u === u && edge.v === v) break;
          }
          if (component.edges.length > 0) {
            components.push(component);
          }
        }
      } else if (v !== parent[u] && disc[v] < disc[u]) {
        edgeStack.push({ u, v, edgeId });
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      dfs(i);
      // Remaining edges form a component
      if (edgeStack.length > 0) {
        const component: BiconnectedComponent = { nodes: new Set(), edges: [] };
        while (edgeStack.length > 0) {
          const edge = edgeStack.pop()!;
          component.nodes.add(graph.nodes[edge.u].id);
          component.nodes.add(graph.nodes[edge.v].id);
          const realEdge = edgeMap.get(edge.edgeId);
          if (realEdge) component.edges.push(realEdge);
        }
        if (component.edges.length > 0) {
          components.push(component);
        }
      }
    }
  }

  return components;
}

// Classify component type
function classifyComponent(component: BiconnectedComponent, graph: Graph): 'S' | 'P' | 'R' {
  const nodeIds = Array.from(component.nodes);
  const edgeCount = component.edges.length;
  const nodeCount = nodeIds.length;

  // Check for parallel edges (P-node)
  const edgePairs = new Map<string, number>();
  for (const edge of component.edges) {
    const key = [edge.source, edge.target].sort().join('-');
    edgePairs.set(key, (edgePairs.get(key) || 0) + 1);
  }
  const hasParallel = Array.from(edgePairs.values()).some(v => v > 1);
  if (hasParallel || (nodeCount === 2 && edgeCount > 1)) {
    return 'P';
  }

  // Series component: forms a path (each node has degree <= 2)
  if (nodeCount > 2) {
    const degrees = new Map<string, number>();
    for (const edge of component.edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
    const allDegrees = Array.from(degrees.values());
    const endNodes = allDegrees.filter(d => d === 1).length;
    const pathNodes = allDegrees.filter(d => d === 2).length;

    if (endNodes === 2 && pathNodes === nodeCount - 2 && edgeCount === nodeCount - 1) {
      return 'S';
    }
  }

  // Simple chain detection
  if (edgeCount === nodeCount - 1) {
    return 'S';
  }

  // Default to Rigid
  return 'R';
}

// Generate SPQR decomposition
export function generateSPQRDecomposition(graph: Graph, disabledEdges: Set<string> = new Set()): SPQRTree {
  const components = findBiconnectedComponents(graph, disabledEdges);
  const bridges = findBridges(graph, disabledEdges);
  const bridgeIds = new Set(bridges.map(e => e.id));

  const spqrNodes = new Map<string, SPQRNode>();
  let nodeIdCounter = 0;

  // Create S-nodes for bridges (series edges)
  for (const bridge of bridges) {
    const nodeId = `spqr-s-${nodeIdCounter++}`;
    const skeleton: Graph = {
      nodes: [
        graph.nodes.find(n => n.id === bridge.source)!,
        graph.nodes.find(n => n.id === bridge.target)!
      ].filter(Boolean),
      edges: [bridge]
    };

    spqrNodes.set(nodeId, {
      id: nodeId,
      type: 'S',
      children: [],
      skeleton
    });
  }

  // Process biconnected components
  for (const component of components) {
    // Skip components that are just single bridges
    if (component.edges.length === 1 && bridgeIds.has(component.edges[0].id)) {
      continue;
    }

    const type = classifyComponent(component, graph);
    const nodeId = `spqr-${type.toLowerCase()}-${nodeIdCounter++}`;

    const skeleton: Graph = {
      nodes: graph.nodes.filter(n => component.nodes.has(n.id)),
      edges: component.edges
    };

    spqrNodes.set(nodeId, {
      id: nodeId,
      type,
      children: [],
      skeleton
    });
  }

  // If no components, create a single root for the whole graph
  if (spqrNodes.size === 0 && graph.nodes.length > 0) {
    const rootId = 'spqr-root';
    spqrNodes.set(rootId, {
      id: rootId,
      type: graph.edges.length <= 1 ? 'S' : 'R',
      children: [],
      skeleton: {
        nodes: graph.nodes,
        edges: graph.edges.filter(e => !disabledEdges.has(e.id))
      }
    });
  }

  // Build tree structure (simplified - connect based on shared nodes)
  const nodeArray = Array.from(spqrNodes.values());
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const nodes1 = new Set(nodeArray[i].skeleton.nodes.map(n => n.id));
      const nodes2 = new Set(nodeArray[j].skeleton.nodes.map(n => n.id));
      const shared = [...nodes1].filter(n => nodes2.has(n));
      if (shared.length > 0) {
        nodeArray[i].children.push(nodeArray[j].id);
      }
    }
  }

  const rootId = nodeArray.length > 0 ? nodeArray[0].id : 'empty';

  return {
    root: rootId,
    nodes: spqrNodes
  };
}

// Get summary statistics for SPQR tree
export function getSPQRStats(tree: SPQRTree): { sCount: number; pCount: number; rCount: number; total: number } {
  let sCount = 0, pCount = 0, rCount = 0;

  tree.nodes.forEach(node => {
    if (node.type === 'S') sCount++;
    else if (node.type === 'P') pCount++;
    else if (node.type === 'R') rCount++;
  });

  return { sCount, pCount, rCount, total: tree.nodes.size };
}
