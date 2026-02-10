import { Graph, Node } from '@/types/graph';
import { reduceCrossings } from './planarity';

/**
 * Planar-Optimized Master Layout
 * 
 * Combines Force-Directed dynamics for spacing with 
 * Simulated Annealing for planar crossing reduction.
 */
export function applyAutoLayout(graph: Graph): Graph {
    // 1. Force-Directed Pass (Initial Spacing)
    let layoutGraph = runForceDirected(graph, 40);

    // 2. Planar Pass (Untangle Knots)
    layoutGraph = reduceCrossings(layoutGraph, 120);

    return layoutGraph;
}

function runForceDirected(graph: Graph, iterations: number): Graph {
    const nodes = graph.nodes.map(n => ({ ...n }));
    const edges = graph.edges;
    const width = 800;
    const height = 600;
    const k = Math.sqrt((width * height) / nodes.length);
    let temp = width / 10;

    for (let iter = 0; iter < iterations; iter++) {
        const displacement = nodes.map(() => ({ x: 0, y: 0 }));

        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
                const force = (k * k) / distance;
                displacement[i].x += (dx / distance) * force;
                displacement[i].y += (dy / distance) * force;
            }
        }

        for (const edge of edges) {
            const uIndex = nodes.findIndex(n => n.id === edge.source);
            const vIndex = nodes.findIndex(n => n.id === edge.target);
            if (uIndex === -1 || vIndex === -1) continue;
            const dx = nodes[uIndex].x - nodes[vIndex].x;
            const dy = nodes[uIndex].y - nodes[vIndex].y;
            const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
            const force = (distance * distance) / k;
            displacement[uIndex].x -= (dx / distance) * force;
            displacement[uIndex].y -= (dy / distance) * force;
            displacement[vIndex].x += (dx / distance) * force;
            displacement[vIndex].y += (dy / distance) * force;
        }

        for (let i = 0; i < nodes.length; i++) {
            const dispLength = Math.sqrt(displacement[i].x * displacement[i].x + displacement[i].y * displacement[i].y);
            if (dispLength === 0) continue;
            const limitedDist = Math.min(dispLength, temp);
            nodes[i].x += (displacement[i].x / dispLength) * limitedDist;
            nodes[i].y += (displacement[i].y / dispLength) * limitedDist;
            nodes[i].x = Math.max(50, Math.min(width - 50, nodes[i].x));
            nodes[i].y = Math.max(50, Math.min(height - 50, nodes[i].y));
        }
        temp *= (1 - iter / iterations);
    }

    // Center the whole graph
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
    });

    const currentCenterX = (minX + maxX) / 2;
    const currentCenterY = (minY + maxY) / 2;
    const offsetX = (width / 2) - currentCenterX;
    const offsetY = (height / 2) - currentCenterY;

    return {
        ...graph,
        nodes: nodes.map(n => ({
            ...n,
            x: Math.round(n.x + offsetX),
            y: Math.round(n.y + offsetY)
        }))
    };
}
