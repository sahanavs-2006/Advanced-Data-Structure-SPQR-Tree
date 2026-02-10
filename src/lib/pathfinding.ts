import { Graph, Node, Edge } from '@/types/graph';

interface PathResult {
  path: string[];
  edges: string[];
  distance: number;
}

// Build adjacency list with edge tracking
function buildAdjacencyList(graph: Graph, disabledEdges: Set<string> = new Set()): Map<string, { node: string; edgeId: string }[]> {
  const adj = new Map<string, { node: string; edgeId: string }[]>();
  
  graph.nodes.forEach(node => {
    adj.set(node.id, []);
  });
  
  graph.edges.forEach(edge => {
    if (disabledEdges.has(edge.id)) return;
    
    adj.get(edge.source)?.push({ node: edge.target, edgeId: edge.id });
    adj.get(edge.target)?.push({ node: edge.source, edgeId: edge.id });
  });
  
  return adj;
}

// BFS to find shortest path
export function findShortestPath(
  graph: Graph, 
  startId: string, 
  endId: string, 
  disabledEdges: Set<string> = new Set()
): PathResult | null {
  if (startId === endId) {
    return { path: [startId], edges: [], distance: 0 };
  }
  
  const adj = buildAdjacencyList(graph, disabledEdges);
  
  const visited = new Set<string>();
  const parent = new Map<string, { node: string; edgeId: string } | null>();
  const queue: string[] = [startId];
  
  visited.add(startId);
  parent.set(startId, null);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === endId) {
      // Reconstruct path
      const path: string[] = [];
      const edges: string[] = [];
      let node: string | null = endId;
      
      while (node !== null) {
        path.unshift(node);
        const parentInfo = parent.get(node);
        if (parentInfo) {
          edges.unshift(parentInfo.edgeId);
          node = parentInfo.node;
        } else {
          node = null;
        }
      }
      
      return { path, edges, distance: path.length - 1 };
    }
    
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        parent.set(neighbor.node, { node: current, edgeId: neighbor.edgeId });
        queue.push(neighbor.node);
      }
    }
  }
  
  return null;
}

// Find all paths (limited by maxPaths for performance)
export function findAllPaths(
  graph: Graph,
  startId: string,
  endId: string,
  disabledEdges: Set<string> = new Set(),
  maxPaths: number = 5
): PathResult[] {
  const paths: PathResult[] = [];
  const adj = buildAdjacencyList(graph, disabledEdges);
  
  function dfs(
    current: string, 
    target: string, 
    visited: Set<string>, 
    currentPath: string[], 
    currentEdges: string[]
  ) {
    if (paths.length >= maxPaths) return;
    
    if (current === target) {
      paths.push({
        path: [...currentPath],
        edges: [...currentEdges],
        distance: currentPath.length - 1
      });
      return;
    }
    
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        currentPath.push(neighbor.node);
        currentEdges.push(neighbor.edgeId);
        
        dfs(neighbor.node, target, visited, currentPath, currentEdges);
        
        currentPath.pop();
        currentEdges.pop();
        visited.delete(neighbor.node);
      }
    }
  }
  
  const visited = new Set<string>([startId]);
  dfs(startId, endId, visited, [startId], []);
  
  // Sort by distance
  paths.sort((a, b) => a.distance - b.distance);
  
  return paths;
}

// Find alternative paths avoiding certain edges
export function findAlternativePaths(
  graph: Graph,
  startId: string,
  endId: string,
  avoidEdges: Set<string>,
  disabledEdges: Set<string> = new Set()
): PathResult[] {
  const combinedDisabled = new Set([...disabledEdges, ...avoidEdges]);
  return findAllPaths(graph, startId, endId, combinedDisabled, 3);
}

// Check if path exists
export function pathExists(
  graph: Graph,
  startId: string,
  endId: string,
  disabledEdges: Set<string> = new Set()
): boolean {
  return findShortestPath(graph, startId, endId, disabledEdges) !== null;
}

// Get path statistics
export function getPathStats(graph: Graph, disabledEdges: Set<string> = new Set()): {
  connectedPairs: number;
  disconnectedPairs: number;
  averagePathLength: number;
} {
  const nodes = graph.nodes;
  let connectedPairs = 0;
  let disconnectedPairs = 0;
  let totalPathLength = 0;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const path = findShortestPath(graph, nodes[i].id, nodes[j].id, disabledEdges);
      if (path) {
        connectedPairs++;
        totalPathLength += path.distance;
      } else {
        disconnectedPairs++;
      }
    }
  }
  
  return {
    connectedPairs,
    disconnectedPairs,
    averagePathLength: connectedPairs > 0 ? totalPathLength / connectedPairs : 0
  };
}
