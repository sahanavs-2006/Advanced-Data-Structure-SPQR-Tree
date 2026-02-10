export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type?: 'S' | 'P' | 'R' | 'default';
  iconType?: 'router' | 'server' | 'database' | 'workstation' | 'cloud' | 'nand' | 'nor' | 'inv' | 'vdd' | 'gnd' | 'res' | 'cap' | 'building' | 'airport' | 'factory' | 'train' | 'hospital' | 'park' | 'substation' | 'terminal' | 'default';
  isCritical?: boolean;
  isSelected?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  isCritical?: boolean;
  isBridge?: boolean;
  type?: 'series' | 'parallel' | 'default';
  isDisabled?: boolean;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface SPQRNode {
  id: string;
  type: 'S' | 'P' | 'R';
  children: string[];
  skeleton: Graph;
}

export interface SPQRTree {
  root: string;
  nodes: Map<string, SPQRNode>;
}

export interface NetworkPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  graph: Graph;
}

export interface AnalysisResult {
  bridges: Edge[];
  articulationPoints: Node[];
  components: Graph[];
  spqrDecomposition?: SPQRTree;
  redundancyScore: number;
  criticalPaths: string[][];
  planarityInfo?: { isPlanar: boolean, message: string };
  crossingCount?: number;
}

export type ToolMode = 'select' | 'addNode' | 'addEdge' | 'delete' | 'simulate' | 'planar';
