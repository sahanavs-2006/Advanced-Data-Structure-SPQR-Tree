import React from 'react';
import { AnalysisResult, Node, Edge } from '@/types/graph';
import { AlertTriangle, CheckCircle, Link, MapPin, Shield, TrendingUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  onHighlightBridge: (edge: Edge) => void;
  onHighlightNode: (node: Node) => void;
  onClearHighlight: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  result,
  onHighlightBridge,
  onHighlightNode,
  onClearHighlight
}) => {
  if (!result) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Click "Analyze" to detect critical points and vulnerabilities in your network
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-critical';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Robust';
    if (score >= 50) return 'Moderate';
    return 'Vulnerable';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Redundancy Score */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">Network Redundancy</span>
          <span className={cn('text-2xl font-bold font-mono', getScoreColor(result.redundancyScore))}>
            {result.redundancyScore}%
          </span>
        </div>
        <Progress value={result.redundancyScore} className="h-2 mb-2" />
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('w-4 h-4', getScoreColor(result.redundancyScore))} />
          <span className={cn('text-sm font-medium', getScoreColor(result.redundancyScore))}>
            {getScoreLabel(result.redundancyScore)}
          </span>
        </div>
      </div>

      {/* Critical Edges (Bridges) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-4 h-4 text-critical" />
          <h3 className="font-semibold text-sm">Critical Edges (Bridges)</h3>
          <span className="ml-auto text-xs bg-critical/20 text-critical px-2 py-0.5 rounded-full font-mono">
            {result.bridges.length}
          </span>
        </div>

        {result.bridges.length === 0 ? (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-success">No single-point edge failures</span>
          </div>
        ) : (
          <div className="space-y-2">
            {result.bridges.map(edge => (
              <button
                key={edge.id}
                onClick={() => onHighlightBridge(edge)}
                onMouseEnter={() => onHighlightBridge(edge)}
                onMouseLeave={onClearHighlight}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-critical/50 hover:bg-critical/5 transition-all text-left"
              >
                <AlertTriangle className="w-4 h-4 text-critical flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {edge.source} → {edge.target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Removing this edge disconnects the network
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Planarity Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Planar Analysis</h3>
          {result.crossingCount !== undefined && (
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full font-mono",
              result.crossingCount === 0 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
            )}>
              {result.crossingCount} Crossings
            </span>
          )}
        </div>

        <div className={cn(
          "p-3 border rounded-lg",
          result.planarityInfo?.isPlanar ? "bg-success/10 border-success/30" : "bg-critical/10 border-critical/30"
        )}>
          <div className="flex items-start gap-2">
            {result.planarityInfo?.isPlanar ? (
              <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-critical mt-0.5" />
            )}
            <div>
              <p className={cn("text-sm font-medium", result.planarityInfo?.isPlanar ? "text-success" : "text-critical")}>
                {result.planarityInfo?.isPlanar ? "Planar Network" : "Non-Planar Component"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.planarityInfo?.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articulation Points */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-warning" />
          <h3 className="font-semibold text-sm">Critical Nodes</h3>
          <span className="ml-auto text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-mono">
            {result.articulationPoints.length}
          </span>
        </div>

        {result.articulationPoints.length === 0 ? (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-success">No single-point node failures</span>
          </div>
        ) : (
          <div className="space-y-2">
            {result.articulationPoints.map(node => (
              <button
                key={node.id}
                onClick={() => onHighlightNode(node)}
                onMouseEnter={() => onHighlightNode(node)}
                onMouseLeave={onClearHighlight}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-warning/50 hover:bg-warning/5 transition-all text-left"
              >
                <div className="w-3 h-3 rounded-full bg-warning flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{node.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Articulation point - critical for connectivity
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          SPQR Legend
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-node-s rounded" />
            <span className="text-muted-foreground">S-node: Series (unavoidable path)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-node-p rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--node-p)), hsl(var(--node-p)) 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-muted-foreground">P-node: Parallel (redundant paths)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-node-r rounded" />
            <span className="text-muted-foreground">R-node: Rigid (complex component)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
