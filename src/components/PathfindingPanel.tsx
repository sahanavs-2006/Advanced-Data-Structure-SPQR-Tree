import React, { useState, useMemo } from 'react';
import { Graph, Node } from '@/types/graph';
import { findShortestPath, findAllPaths, findAlternativePaths } from '@/lib/pathfinding';
import { Route, Navigation, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PathfindingPanelProps {
  graph: Graph;
  disabledEdges: Set<string>;
  onHighlightPath: (nodeIds: string[], edgeIds: string[]) => void;
  onClearHighlight: () => void;
}

export const PathfindingPanel: React.FC<PathfindingPanelProps> = ({
  graph,
  disabledEdges,
  onHighlightPath,
  onClearHighlight
}) => {
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [showAlternatives, setShowAlternatives] = useState(false);

  const shortestPath = useMemo(() => {
    if (!startNode || !endNode || startNode === endNode) return null;
    return findShortestPath(graph, startNode, endNode, disabledEdges);
  }, [graph, startNode, endNode, disabledEdges]);

  const allPaths = useMemo(() => {
    if (!startNode || !endNode || startNode === endNode) return [];
    return findAllPaths(graph, startNode, endNode, disabledEdges, 5);
  }, [graph, startNode, endNode, disabledEdges]);

  const alternativePaths = useMemo(() => {
    if (!shortestPath || shortestPath.edges.length === 0) return [];
    const avoidEdges = new Set(shortestPath.edges);
    return findAlternativePaths(graph, startNode, endNode, avoidEdges, disabledEdges);
  }, [graph, startNode, endNode, shortestPath, disabledEdges]);

  const handlePathHover = (path: { path: string[]; edges: string[] }) => {
    onHighlightPath(path.path, path.edges);
  };

  const getNodeLabel = (nodeId: string) => {
    return graph.nodes.find(n => n.id === nodeId)?.label || nodeId;
  };

  const handleSwapNodes = () => {
    const temp = startNode;
    setStartNode(endNode);
    setEndNode(temp);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" />
          Pathfinding
        </h3>
        
        {/* Node Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Select value={startNode} onValueChange={setStartNode}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select start" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {graph.nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={handleSwapNodes}
              disabled={!startNode && !endNode}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Select value={endNode} onValueChange={setEndNode}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select end" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {graph.nodes.filter(n => n.id !== startNode).map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {startNode && endNode && startNode !== endNode && (
        <div className="space-y-3">
          {/* Shortest Path */}
          <div className={cn(
            'p-3 rounded-lg border transition-all',
            shortestPath 
              ? 'bg-success/10 border-success/30' 
              : 'bg-critical/10 border-critical/30'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {shortestPath ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-critical" />
              )}
              <span className={cn(
                'font-medium text-sm',
                shortestPath ? 'text-success' : 'text-critical'
              )}>
                {shortestPath ? 'Path Found' : 'No Path Available'}
              </span>
              {shortestPath && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {shortestPath.distance} hop{shortestPath.distance !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {shortestPath && (
              <div
                className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-foreground transition-colors"
                onMouseEnter={() => handlePathHover(shortestPath)}
                onMouseLeave={onClearHighlight}
              >
                {shortestPath.path.map((nodeId, i) => (
                  <span key={nodeId}>
                    {getNodeLabel(nodeId)}
                    {i < shortestPath.path.length - 1 && (
                      <span className="text-primary mx-1">→</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* All Paths Toggle */}
          {allPaths.length > 1 && (
            <div>
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                {showAlternatives ? 'Hide' : 'Show'} {allPaths.length} available routes
              </button>
              
              {showAlternatives && (
                <div className="mt-2 space-y-2">
                  {allPaths.map((path, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-2 rounded border border-border bg-card cursor-pointer',
                        'hover:border-primary/50 hover:bg-primary/5 transition-all'
                      )}
                      onMouseEnter={() => handlePathHover(path)}
                      onMouseLeave={onClearHighlight}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Route {index + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {path.distance} hop{path.distance !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {path.path.map((nodeId, i) => (
                          <span key={i}>
                            {getNodeLabel(nodeId)}
                            {i < path.path.length - 1 && (
                              <span className="text-muted-foreground/50 mx-1">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alternative Paths (avoiding main route) */}
          {shortestPath && alternativePaths.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-warning" />
                <span className="text-xs font-medium text-warning">
                  Alternative Routes (avoiding main path)
                </span>
              </div>
              <div className="space-y-2">
                {alternativePaths.slice(0, 3).map((path, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-2 rounded border border-warning/30 bg-warning/5 cursor-pointer',
                      'hover:border-warning/50 transition-all'
                    )}
                    onMouseEnter={() => handlePathHover(path)}
                    onMouseLeave={onClearHighlight}
                  >
                    <div className="text-xs text-muted-foreground font-mono">
                      {path.path.map((nodeId, i) => (
                        <span key={i}>
                          {getNodeLabel(nodeId)}
                          {i < path.path.length - 1 && (
                            <span className="text-warning/50 mx-1">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No alternatives warning */}
          {shortestPath && alternativePaths.length === 0 && allPaths.length === 1 && (
            <div className="p-2 rounded border border-critical/30 bg-critical/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-critical" />
                <span className="text-xs text-critical">
                  No alternative routes - this path is critical!
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {(!startNode || !endNode) && (
        <div className="text-xs text-muted-foreground italic">
          💡 Select two nodes to find paths between them. Disabled edges will be avoided.
        </div>
      )}
    </div>
  );
};
