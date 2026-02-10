import { networkPresets } from '../data/presets';
import { generateSPQRDecomposition, getSPQRStats } from '../lib/spqrDecomposition';
import { findBridges, findArticulationPoints } from '../lib/graphAnalysis';
import * as fs from 'fs';

let md = '# SPQR Decomposition Verification Results\n\n';
md += '| Preset | Nodes | Edges | Series | Parallel | Rigid | Bridges | APs |\n';
md += '|--------|-------|-------|--------|----------|-------|---------|-----|\n';

networkPresets.forEach(preset => {
    const spqrTree = generateSPQRDecomposition(preset.graph);
    const stats = getSPQRStats(spqrTree);
    const bridges = findBridges(preset.graph);
    const articulationPoints = findArticulationPoints(preset.graph);

    md += `| ${preset.name} | ${preset.graph.nodes.length} | ${preset.graph.edges.length} | ${stats.sCount} | ${stats.pCount} | ${stats.rCount} | ${bridges.length} | ${articulationPoints.length} |\n`;
});

md += '\n## Bridge Details\n\n';

networkPresets.forEach(preset => {
    const bridges = findBridges(preset.graph);
    if (bridges.length > 0) {
        md += `### ${preset.name}\n`;
        bridges.forEach(b => {
            const src = preset.graph.nodes.find(n => n.id === b.source)?.label || b.source;
            const tgt = preset.graph.nodes.find(n => n.id === b.target)?.label || b.target;
            md += `- ${src} ↔ ${tgt}\n`;
        });
        md += '\n';
    }
});

fs.writeFileSync('SPQR_VERIFICATION.md', md);
console.log('Done! Check SPQR_VERIFICATION.md');
