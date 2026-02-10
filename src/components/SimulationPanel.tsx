import React from 'react';
import { Edge, Graph } from '@/types/graph';
import { isConnected } from '@/lib/graphAnalysis';
import { AlertCircle, CheckCircle2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimulationPanelProps {
  graph: Graph;
  disabledEdges: Set<string>;
  onToggleEdge: (edgeId: string) => void;
  onResetSimulation: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  graph,
  disabledEdges,
  onToggleEdge,
  onResetSimulation
}) => {
  const connected = isConnected(graph, disabledEdges);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Failure Simulation</h3>
        {disabledEdges.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetSimulation}
            className="h-7 text-xs"
          >
            Reset All
          </Button>
        )}
      </div>

      {/* Connection Status */}
      <div className={cn(
        'p-4 rounded-lg border transition-all',
        connected 
          ? 'bg-success/10 border-success/30' 
          : 'bg-critical/10 border-critical/30 glow-border-destructive'
      )}>
        <div className="flex items-center gap-3">
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-critical animate-pulse" />
          )}
          <div>
            <p className={cn(
              'font-semibold',
              connected ? 'text-success' : 'text-critical'
            )}>
              {connected ? 'Network Connected' : 'Network Disconnected!'}
            </p>
            <p className="text-xs text-muted-foreground">
              {disabledEdges.size === 0 
                ? 'Click edges to simulate failures'
                : `${disabledEdges.size} edge(s) disabled`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Edge List */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Edge Status
        </h4>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {graph.edges.map(edge => {
            const isDisabled = disabledEdges.has(edge.id);
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            return (
              <button
                key={edge.id}
                onClick={() => onToggleEdge(edge.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left text-sm',
                  'border',
                  isDisabled 
                    ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                    : 'bg-card border-border hover:border-primary/30'
                )}
              >
                {isDisabled ? (
                  <PowerOff className="w-4 h-4 text-destructive" />
                ) : (
                  <Power className="w-4 h-4 text-success" />
                )}
                <span className="flex-1 truncate font-mono text-xs">
                  {sourceNode?.label || edge.source} → {targetNode?.label || edge.target}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">
        💡 Tip: In simulation mode, click directly on edges in the graph to toggle them
      </p>
    </div>
  );
};
