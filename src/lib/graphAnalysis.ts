import { Graph, Node, Edge, AnalysisResult } from '@/types/graph';
import { checkPlanarity, countCrossings } from './planarity';

// Find bridges (critical edges) using Tarjan's algorithm
export function findBridges(graph: Graph, disabledEdges: Set<string> = new Set()): Edge[] {
  const activeEdges = graph.edges.filter(e => !disabledEdges.has(e.id));
  const n = graph.nodes.length;
  if (n === 0) return [];

  const nodeIndex = new Map<string, number>();
  graph.nodes.forEach((node, i) => nodeIndex.set(node.id, i));

  const adj: number[][] = Array.from({ length: n }, () => []);
  const edgeMap = new Map<string, Edge>();

  activeEdges.forEach(edge => {
    const u = nodeIndex.get(edge.source);
    const v = nodeIndex.get(edge.target);
    if (u !== undefined && v !== undefined) {
      adj[u].push(v);
      adj[v].push(u);
      edgeMap.set(`${u}-${v}`, edge);
      edgeMap.set(`${v}-${u}`, edge);
    }
  });

  const visited = new Array(n).fill(false);
  const disc = new Array(n).fill(0);
  const low = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  const bridges: Edge[] = [];
  let time = 0;

  function dfs(u: number) {
    visited[u] = true;
    disc[u] = low[u] = ++time;

    for (const v of adj[u]) {
      if (!visited[v]) {
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        if (low[v] > disc[u]) {
          const edge = edgeMap.get(`${u}-${v}`) || edgeMap.get(`${v}-${u}`);
          if (edge) bridges.push(edge);
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      dfs(i);
    }
  }

  return bridges;
}

// Find articulation points (critical nodes)
export function findArticulationPoints(graph: Graph, disabledEdges: Set<string> = new Set()): Node[] {
  const activeEdges = graph.edges.filter(e => !disabledEdges.has(e.id));
  const n = graph.nodes.length;
  if (n === 0) return [];

  const nodeIndex = new Map<string, number>();
  graph.nodes.forEach((node, i) => nodeIndex.set(node.id, i));

  const adj: number[][] = Array.from({ length: n }, () => []);

  activeEdges.forEach(edge => {
    const u = nodeIndex.get(edge.source);
    const v = nodeIndex.get(edge.target);
    if (u !== undefined && v !== undefined) {
      adj[u].push(v);
      adj[v].push(u);
    }
  });

  const visited = new Array(n).fill(false);
  const disc = new Array(n).fill(0);
  const low = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  const ap = new Set<number>();
  let time = 0;

  function dfs(u: number) {
    let children = 0;
    visited[u] = true;
    disc[u] = low[u] = ++time;

    for (const v of adj[u]) {
      if (!visited[v]) {
        children++;
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        if (parent[u] === -1 && children > 1) {
          ap.add(u);
        }

        if (parent[u] !== -1 && low[v] >= disc[u]) {
          ap.add(u);
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      dfs(i);
    }
  }

  return Array.from(ap).map(i => graph.nodes[i]);
}

// Check if graph is connected
export function isConnected(graph: Graph, disabledEdges: Set<string> = new Set()): boolean {
  if (graph.nodes.length === 0) return true;

  const nodeIndex = new Map<string, number>();
  graph.nodes.forEach((node, i) => nodeIndex.set(node.id, i));

  const adj: number[][] = Array.from({ length: graph.nodes.length }, () => []);

  graph.edges.forEach(edge => {
    if (disabledEdges.has(edge.id)) return;
    const u = nodeIndex.get(edge.source);
    const v = nodeIndex.get(edge.target);
    if (u !== undefined && v !== undefined) {
      adj[u].push(v);
      adj[v].push(u);
    }
  });

  const visited = new Set<number>();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
      }
    }
  }

  return visited.size === graph.nodes.length;
}

// Identify edge types (series/parallel approximation)
export function classifyEdges(graph: Graph): Edge[] {
  const bridges = findBridges(graph);
  const bridgeIds = new Set(bridges.map(e => e.id));

  return graph.edges.map(edge => {
    if (bridgeIds.has(edge.id)) {
      return { ...edge, type: 'series' as const, isBridge: true };
    }
    // Check if there are multiple paths (parallel)
    const hasParallel = graph.edges.some(
      e => e.id !== edge.id &&
        ((e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source))
    );
    return { ...edge, type: hasParallel ? 'parallel' as const : 'default' as const };
  });
}

// Calculate redundancy score (0-100)
export function calculateRedundancy(graph: Graph, disabledEdges: Set<string> = new Set()): number {
  if (graph.nodes.length < 2) return 100;

  const bridges = findBridges(graph, disabledEdges);
  const articulationPoints = findArticulationPoints(graph, disabledEdges);
  const activeEdges = graph.edges.filter(e => !disabledEdges.has(e.id));

  const edgeRedundancy = activeEdges.length > 0
    ? (1 - bridges.length / activeEdges.length) * 50
    : 0;

  const nodeRedundancy = graph.nodes.length > 0
    ? (1 - articulationPoints.length / graph.nodes.length) * 50
    : 50;

  return Math.max(0, Math.round(edgeRedundancy + nodeRedundancy));
}

// Full analysis
export function analyzeGraph(graph: Graph, disabledEdges: Set<string> = new Set()): AnalysisResult {
  const bridges = findBridges(graph, disabledEdges);
  const articulationPoints = findArticulationPoints(graph, disabledEdges);
  const redundancyScore = calculateRedundancy(graph, disabledEdges);

  // Mark bridges in edges
  const bridgeIds = new Set(bridges.map(e => e.id));
  const classifiedEdges = graph.edges.map(edge => ({
    ...edge,
    isBridge: bridgeIds.has(edge.id),
    isCritical: bridgeIds.has(edge.id)
  }));

  // Mark articulation points
  const apIds = new Set(articulationPoints.map(n => n.id));
  const classifiedNodes = graph.nodes.map(node => ({
    ...node,
    isCritical: apIds.has(node.id)
  }));

  return {
    bridges,
    articulationPoints,
    components: [],
    redundancyScore,
    criticalPaths: [],
    planarityInfo: checkPlanarity(graph, disabledEdges),
    crossingCount: countCrossings(graph, disabledEdges)
  };
}
