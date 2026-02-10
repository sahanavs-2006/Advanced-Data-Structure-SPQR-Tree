# Smart Infrastructure Network Analyzer - Technical Documentation

## Project Overview

The **Smart Infrastructure Network Analyzer** is a sophisticated web application for visualizing and analyzing network robustness using graph theory algorithms. It helps identify critical infrastructure vulnerabilities, single points of failure, and network redundancy through interactive SPQR tree decomposition.

### Key Applications

1. **City Road Networks** - Identify critical roads that, if closed, would disconnect traffic
2. **Power Grid Analysis** - Find vulnerable transmission lines and substations
3. **Railway Networks** - Detect single-track dependencies and critical junctions
4. **Microservices Architecture** - Analyze service dependencies and failure cascades
5. **ISP Backbone** - Evaluate internet infrastructure redundancy

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Application                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │   Header    │  │   NetworkGraph   │  │      Right Sidebar          │ │
│  │  (NavBar)   │  │   (SVG Canvas)   │  │  ┌─────────────────────────┐│ │
│  └─────────────┘  │                  │  │  │    AnalysisPanel       ││ │
│  ┌─────────────┐  │  - Nodes         │  │  ├─────────────────────────┤│ │
│  │   Left      │  │  - Edges         │  │  │    SPQRTreePanel       ││ │
│  │  Sidebar    │  │  - Interactions  │  │  ├─────────────────────────┤│ │
│  │             │  │                  │  │  │   PathfindingPanel     ││ │
│  │ PresetSel.  │  └──────────────────┘  │  ├─────────────────────────┤│ │
│  │             │  ┌──────────────────┐  │  │   SimulationPanel      ││ │
│  │             │  │     Toolbar      │  │  └─────────────────────────┘│ │
│  │             │  │  (Tool buttons)  │  │                             │ │
│  └─────────────┘  └──────────────────┘  └─────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                           StatsBar                                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Data Structures

### `src/types/graph.ts`

```typescript
// Node represents a point in the network (intersection, station, service, etc.)
interface Node {
  id: string;           // Unique identifier
  x: number;            // X coordinate on canvas
  y: number;            // Y coordinate on canvas
  label: string;        // Display name
  type?: 'S' | 'P' | 'R' | 'default';  // SPQR classification
  isCritical?: boolean; // Is this an articulation point?
  isSelected?: boolean; // UI selection state
}

// Edge represents a connection (road, power line, API call, etc.)
interface Edge {
  id: string;           // Unique identifier
  source: string;       // Source node ID
  target: string;       // Target node ID
  isCritical?: boolean; // Is this a bridge?
  isBridge?: boolean;   // Same as isCritical (for clarity)
  type?: 'series' | 'parallel' | 'default';  // Edge classification
  isDisabled?: boolean; // Simulation state
}

// Graph is the main data structure
interface Graph {
  nodes: Node[];
  edges: Edge[];
}

// SPQR Node for tree decomposition
interface SPQRNode {
  id: string;
  type: 'S' | 'P' | 'R';  // Series, Parallel, or Rigid
  children: string[];     // Child node IDs in tree
  skeleton: Graph;        // Subgraph represented by this node
}

// SPQR Tree structure
interface SPQRTree {
  root: string;                    // Root node ID
  nodes: Map<string, SPQRNode>;    // All nodes in tree
}

// Analysis results
interface AnalysisResult {
  bridges: Edge[];              // Critical edges (single point of failure)
  articulationPoints: Node[];   // Critical nodes
  components: Graph[];          // Connected components
  spqrDecomposition?: SPQRTree; // SPQR tree
  redundancyScore: number;      // 0-100 robustness score
  criticalPaths: string[][];    // Paths through critical points
}
```

---

## Algorithm Implementations

### 1. Bridge Detection (Tarjan's Algorithm)
**File:** `src/lib/graphAnalysis.ts`

A **bridge** is an edge whose removal disconnects the graph. Tarjan's algorithm finds all bridges in O(V + E) time.

```typescript
function findBridges(graph: Graph): Edge[] {
  // Uses DFS with discovery and low times
  // low[v] = minimum discovery time reachable from subtree of v
  // Edge (u,v) is bridge if low[v] > disc[u]
}
```

**How it works:**
1. Perform DFS traversal, tracking discovery time for each node
2. Calculate "low" value = earliest visited vertex reachable from subtree
3. An edge (u,v) is a bridge if `low[v] > disc[u]`
4. This means v's subtree cannot reach any ancestor of u

### 2. Articulation Point Detection
**File:** `src/lib/graphAnalysis.ts`

An **articulation point** is a node whose removal disconnects the graph.

```typescript
function findArticulationPoints(graph: Graph): Node[] {
  // Similar to bridge detection
  // Node u is articulation point if:
  // 1. u is root of DFS tree and has 2+ children, OR
  // 2. u is not root and has child v where low[v] >= disc[u]
}
```

### 3. SPQR Tree Decomposition
**File:** `src/lib/spqrDecomposition.ts`

SPQR decomposition breaks a graph into three component types:

| Type | Name | Meaning | Robustness |
|------|------|---------|------------|
| **S** | Series | Path-like, unavoidable route | ❌ Critical |
| **P** | Parallel | Multiple redundant paths | ✅ Robust |
| **R** | Rigid | Complex triconnected structure | ⚠️ Depends |

```typescript
function generateSPQRDecomposition(graph: Graph): SPQRTree {
  // 1. Find biconnected components
  // 2. Classify each as S, P, or R
  // 3. Build hierarchical tree structure
}
```

**Classification Logic:**
- **S-node**: If component forms a simple path (all nodes have degree ≤ 2)
- **P-node**: If there are parallel edges between same endpoints
- **R-node**: If component is triconnected (no 2-cut exists)

### 4. Pathfinding (BFS/DFS)
**File:** `src/lib/pathfinding.ts`

```typescript
// Find shortest path using BFS
function findShortestPath(graph, start, end, disabledEdges): PathResult

// Find all paths (up to limit) using DFS
function findAllPaths(graph, start, end, disabledEdges, maxPaths): PathResult[]

// Find alternative routes avoiding specific edges
function findAlternativePaths(graph, start, end, avoidEdges, disabledEdges): PathResult[]
```

### 5. Connectivity Check
**File:** `src/lib/graphAnalysis.ts`

```typescript
function isConnected(graph: Graph, disabledEdges: Set<string>): boolean {
  // BFS from node 0
  // Graph is connected if we can reach all nodes
}
```

### 6. Redundancy Score Calculation

```typescript
function calculateRedundancy(graph: Graph): number {
  // Score 0-100 based on:
  // 50% from edge redundancy: (1 - bridges/totalEdges) * 50
  // 50% from node redundancy: (1 - articulationPoints/totalNodes) * 50
  
  // High score = robust network with alternatives
  // Low score = fragile network with single points of failure
}
```

---

## Component Details

### NetworkGraph.tsx
**Purpose:** Interactive SVG canvas for graph visualization

**Features:**
- Drag nodes to reposition
- Click to select/interact
- Visual indicators for critical elements
- Real-time edge drawing preview
- Glow effects for highlighted elements

**Tool Modes:**
| Mode | Key | Action |
|------|-----|--------|
| Select | V | Drag nodes, select elements |
| Add Node | N | Click canvas to add node |
| Add Edge | E | Click two nodes to connect |
| Delete | D | Click node/edge to remove |
| Simulate | S | Click edges to disable/enable |

### AnalysisPanel.tsx
**Purpose:** Display analysis results

**Shows:**
- Redundancy score with progress bar
- List of bridge edges (critical connections)
- List of articulation points (critical nodes)
- SPQR legend

### SPQRTreePanel.tsx
**Purpose:** Visualize SPQR tree decomposition

**Features:**
- Hierarchical tree view
- Expandable nodes
- Hover to highlight corresponding graph elements
- Component statistics (S/P/R counts)

### PathfindingPanel.tsx
**Purpose:** Find and visualize paths between nodes

**Features:**
- Node selection dropdowns
- Shortest path calculation
- All available routes
- Alternative paths avoiding main route
- Critical path warnings

### SimulationPanel.tsx
**Purpose:** Interactive failure simulation

**Features:**
- Toggle edges on/off
- Real-time connectivity status
- Visual feedback for network state

---

## Presets

### City Roads
- Nodes: Downtown, Mall, Airport, Hospital, Stadium, University, Station, Park
- Tests: Traffic flow, road closures, detour availability

### Power Grid
- Nodes: Power plants, Substations, Districts
- Tests: Grid resilience, blackout risk, load balancing

### Railway Network
- Nodes: Major Indian cities (Mumbai, Pune, Nagpur, etc.)
- Tests: Track failures, alternative routes, junction criticality

### Microservices
- Nodes: API Gateway, Auth, Users, Products, Orders, Inventory, Database
- Tests: Service dependencies, cascade failures, bottlenecks

### ISP Backbone
- Nodes: Core Router, Edge routers, POPs, Users
- Tests: Fiber cuts, router failures, user isolation

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| State Management | React useState/useCallback |

---

## Usage Guide

### Basic Workflow

1. **Select a Preset** - Choose from left sidebar (City Roads, Power Grid, etc.)
2. **Analyze Network** - Click "Analyze" button in toolbar
3. **View Results** - Check Analysis tab for bridges and articulation points
4. **Explore SPQR** - Switch to SPQR tab to see decomposition
5. **Find Paths** - Use Paths tab to find routes between nodes
6. **Simulate Failures** - Use Simulate tab or press 'S' to toggle edges

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select mode |
| N | Add node mode |
| E | Add edge mode |
| D | Delete mode |
| S | Simulate mode |

### Interpreting Results

**Redundancy Score:**
- **80-100%** (Green): Robust network with good redundancy
- **50-79%** (Yellow): Moderate - some vulnerabilities exist
- **0-49%** (Red): Vulnerable - many single points of failure

**Bridge Edges (Red):**
- Removing these disconnects the network
- Should have backup routes or protection

**Articulation Points (Orange):**
- Removing these nodes disconnects the network
- Critical infrastructure that needs redundancy

---

## File Structure

```
src/
├── components/
│   ├── AnalysisPanel.tsx    # Analysis results display
│   ├── Header.tsx           # Top navigation bar
│   ├── NetworkGraph.tsx     # SVG graph canvas
│   ├── PathfindingPanel.tsx # Path finding UI
│   ├── PresetSelector.tsx   # Preset chooser
│   ├── SimulationPanel.tsx  # Failure simulation
│   ├── SPQRTreePanel.tsx    # SPQR visualization
│   ├── StatsBar.tsx         # Bottom statistics
│   └── Toolbar.tsx          # Tool mode buttons
├── data/
│   └── presets.ts           # Network preset definitions
├── lib/
│   ├── graphAnalysis.ts     # Core algorithms
│   ├── pathfinding.ts       # BFS/DFS pathfinding
│   ├── spqrDecomposition.ts # SPQR tree generation
│   └── utils.ts             # Utility functions
├── pages/
│   └── Index.tsx            # Main application page
├── types/
│   └── graph.ts             # TypeScript interfaces
└── index.css                # Global styles & theme
```

---

## Real-World Applications

### 1. Traffic Engineering
Use the City Roads preset to identify:
- Which roads, if closed, would cause major congestion
- Where to add new roads for redundancy
- Optimal detour planning

### 2. Power Grid Planning
Use the Power Grid preset to:
- Find substations that are single points of failure
- Plan redundant transmission lines
- Simulate blackout scenarios

### 3. Network Infrastructure
Use the ISP Backbone preset to:
- Identify fiber routes that need protection
- Plan router redundancy
- Simulate cable cuts

### 4. Software Architecture
Use the Microservices preset to:
- Find tightly coupled services
- Identify database bottlenecks
- Plan for graceful degradation

---

## Extending the Application

### Adding New Presets

1. Edit `src/data/presets.ts`
2. Add new preset object with nodes and edges
3. Include meaningful labels and realistic topology

### Adding New Algorithms

1. Create new file in `src/lib/`
2. Export pure functions that take Graph as input
3. Integrate into analysis or create new panel

### Customizing Visualization

1. Edit `src/index.css` for colors and effects
2. Modify `NetworkGraph.tsx` for node/edge rendering
3. Update `tailwind.config.ts` for theme tokens

---

## Performance Considerations

- **O(V + E)** for bridge/articulation point detection
- **O(V * E)** worst case for all-paths DFS
- Pathfinding limited to 5 paths by default
- Large graphs (>100 nodes) may have slight delays

---

## Glossary

| Term | Definition |
|------|------------|
| **Bridge** | Edge whose removal disconnects the graph |
| **Articulation Point** | Node whose removal disconnects the graph |
| **Biconnected Component** | Maximal subgraph with no articulation points |
| **SPQR Tree** | Hierarchical decomposition of graph structure |
| **S-node** | Series component (path) |
| **P-node** | Parallel component (redundant paths) |
| **R-node** | Rigid component (triconnected) |
| **Redundancy** | Availability of alternative paths |

---

## References

1. Tarjan, R. E. (1972). "Depth-first search and linear graph algorithms"
2. Di Battista, G. & Tamassia, R. (1996). "On-line planarity testing"
3. Gutwenger, C. & Mutzel, P. (2001). "A linear time implementation of SPQR-trees"

---

*This documentation is automatically generated and may be updated as the application evolves.*
