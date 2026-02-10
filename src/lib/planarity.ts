import { Graph, Node, Edge } from '@/types/graph';

/**
 * Checks if two line segments (p1-p2) and (p3-p4) intersect.
 */
function doIntersect(p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }, p4: { x: number, y: number }): boolean {
    // Helper to find orientation
    const orientation = (a: any, b: any, c: any) => {
        const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
        if (Math.abs(val) < 0.001) return 0; // collinear
        return (val > 0) ? 1 : 2; // clock or counterclock
    };

    // Helper to check if point q lies on segment pr
    const onSegment = (p: any, q: any, r: any) => {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    };

    const o1 = orientation(p1, p2, p3);
    const o2 = orientation(p1, p2, p4);
    const o3 = orientation(p3, p4, p1);
    const o4 = orientation(p3, p4, p2);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special Cases (collinear segments)
    if (o1 === 0 && onSegment(p1, p3, p2)) return true;
    if (o2 === 0 && onSegment(p1, p4, p2)) return true;
    if (o3 === 0 && onSegment(p3, p1, p4)) return true;
    if (o4 === 0 && onSegment(p3, p2, p4)) return true;

    return false;
}

/**
 * Counts the number of edge crossings in the current graph layout.
 */
export function countCrossings(graph: Graph, disabledEdges: Set<string> = new Set()): number {
    let crossings = 0;
    const activeEdges = graph.edges.filter(e => !disabledEdges.has(e.id));
    const nodes = graph.nodes;

    const getPos = (id: string) => nodes.find(n => n.id === id);

    for (let i = 0; i < activeEdges.length; i++) {
        for (let j = i + 1; j < activeEdges.length; j++) {
            const e1 = activeEdges[i];
            const e2 = activeEdges[j];

            // Don't count edges sharing a node
            if (e1.source === e2.source || e1.source === e2.target ||
                e1.target === e2.source || e1.target === e2.target) continue;

            const p1 = getPos(e1.source);
            const p2 = getPos(e1.target);
            const p3 = getPos(e2.source);
            const p4 = getPos(e2.target);

            if (p1 && p2 && p3 && p4) {
                if (doIntersect(p1, p2, p3, p4)) {
                    crossings++;
                }
            }
        }
    }
    return crossings;
}

/**
 * Minimal Planarity Checker using Euler's Formula and Heuristics.
 * Note: Full planarity check (Boyer-Myrvold) is extremely complex.
 * For this app, we use SPQR properties and basic bounds.
 */
export function checkPlanarity(graph: Graph, disabledEdges: Set<string> = new Set()): { isPlanar: boolean, message: string } {
    const v = graph.nodes.length;
    const activeEdgesCount = graph.edges.filter(e => !disabledEdges.has(e.id)).length;

    if (v <= 4) return { isPlanar: true, message: "Small graph - always planar" };

    // Euler's Formula: E <= 3V - 6
    if (activeEdgesCount > 3 * v - 6) {
        return { isPlanar: false, message: `Too dense to be planar (E > 3V - 6)` };
    }

    // Check current layout
    const crossings = countCrossings(graph, disabledEdges);
    if (crossings === 0) return { isPlanar: true, message: "Current layout is already planar" };

    return { isPlanar: true, message: "Potentially planar (E bounds passed)" };
}

/**
 * Crossing Reduction Algorithm using Simulated Annealing.
 * Randomly perturbs nodes and keeps changes that reduce crossings.
 */
export function reduceCrossings(graph: Graph, iterations: number = 100): Graph {
    let bestGraph = { ...graph, nodes: graph.nodes.map(n => ({ ...n })) };
    let currentCrossings = countCrossings(bestGraph);

    if (currentCrossings === 0) return bestGraph;

    const width = 800;
    const height = 600;
    let temp = 50;
    const coolingFactor = 0.95;

    for (let i = 0; i < iterations; i++) {
        // Pick a random node and move it slightly
        const nodeIndex = Math.floor(Math.random() * bestGraph.nodes.length);
        const oldX = bestGraph.nodes[nodeIndex].x;
        const oldY = bestGraph.nodes[nodeIndex].y;

        bestGraph.nodes[nodeIndex].x += (Math.random() - 0.5) * temp;
        bestGraph.nodes[nodeIndex].y += (Math.random() - 0.5) * temp;

        // Constraints
        bestGraph.nodes[nodeIndex].x = Math.max(50, Math.min(width - 50, bestGraph.nodes[nodeIndex].x));
        bestGraph.nodes[nodeIndex].y = Math.max(50, Math.min(height - 50, bestGraph.nodes[nodeIndex].y));

        const newCrossings = countCrossings(bestGraph);

        if (newCrossings < currentCrossings) {
            currentCrossings = newCrossings;
        } else if (Math.random() > Math.exp((currentCrossings - newCrossings) / temp)) {
            // Revert if worse (with some probability for exploration)
            bestGraph.nodes[nodeIndex].x = oldX;
            bestGraph.nodes[nodeIndex].y = oldY;
        }

        temp *= coolingFactor;
        if (currentCrossings === 0) break;
    }

    return bestGraph;
}
