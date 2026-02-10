import React, { useMemo, useState } from 'react';
import { Graph, SPQRTree, SPQRNode } from '@/types/graph';
import { generateSPQRDecomposition, getSPQRStats } from '@/lib/spqrDecomposition';
import { ChevronDown, ChevronRight, GitBranch, Layers, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SPQRTreePanelProps {
  graph: Graph;
  disabledEdges: Set<string>;
  onHighlightComponent: (nodeIds: string[], edgeIds: string[]) => void;
  onClearHighlight: () => void;
}

const SPQRNodeIcon: React.FC<{ type: 'S' | 'P' | 'R' }> = ({ type }) => {
  switch (type) {
    case 'S':
      return <Workflow className="w-4 h-4 text-node-s" />;
    case 'P':
      return <GitBranch className="w-4 h-4 text-node-p" />;
    case 'R':
      return <Layers className="w-4 h-4 text-node-r" />;
  }
};

const SPQRNodeItem: React.FC<{
  node: SPQRNode;
  tree: SPQRTree;
  depth: number;
  onHighlight: (nodeIds: string[], edgeIds: string[]) => void;
  onClear: () => void;
}> = ({ node, tree, depth, onHighlight, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  const handleMouseEnter = () => {
    const nodeIds = node.skeleton.nodes.map(n => n.id);
    const edgeIds = node.skeleton.edges.map(e => e.id);
    onHighlight(nodeIds, edgeIds);
  };

  const getTypeLabel = (type: 'S' | 'P' | 'R') => {
    switch (type) {
      case 'S': return 'Series';
      case 'P': return 'Parallel';
      case 'R': return 'Rigid';
    }
  };

  const getTypeDescription = (type: 'S' | 'P' | 'R') => {
    switch (type) {
      case 'S': return 'Unavoidable path - critical for connectivity';
      case 'P': return 'Redundant paths - network has alternatives';
      case 'R': return 'Complex structure - multiple constraints';
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all',
          'hover:bg-muted/50 border border-transparent hover:border-border',
          depth === 0 && 'bg-muted/30'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onClear}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}

        <SPQRNodeIcon type={node.type} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{getTypeLabel(node.type)}</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                node.type === 'S' && 'border-node-s text-node-s',
                node.type === 'P' && 'border-node-p text-node-p',
                node.type === 'R' && 'border-node-r text-node-r'
              )}
            >
              {node.skeleton.nodes.length}N / {node.skeleton.edges.length}E
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {getTypeDescription(node.type)}
          </p>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map(childId => {
            const childNode = tree.nodes.get(childId);
            if (!childNode) return null;
            return (
              <SPQRNodeItem
                key={childId}
                node={childNode}
                tree={tree}
                depth={depth + 1}
                onHighlight={onHighlight}
                onClear={onClear}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SPQRTreePanel: React.FC<SPQRTreePanelProps> = ({
  graph,
  disabledEdges,
  onHighlightComponent,
  onClearHighlight
}) => {
  const spqrTree = useMemo(() => generateSPQRDecomposition(graph, disabledEdges), [graph, disabledEdges]);
  const stats = useMemo(() => getSPQRStats(spqrTree), [spqrTree]);

  const rootNode = spqrTree.nodes.get(spqrTree.root);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          SPQR Tree Decomposition
        </h3>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <div className="stat-card text-center py-2 px-1 min-w-0">
            <div className="text-lg font-bold font-mono text-node-s truncate">{stats.sCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Series</div>
          </div>
          <div className="stat-card text-center py-2 px-1 min-w-0">
            <div className="text-lg font-bold font-mono text-node-p truncate">{stats.pCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Parallel</div>
          </div>
          <div className="stat-card text-center py-2 px-1 min-w-0">
            <div className="text-lg font-bold font-mono text-node-r truncate">{stats.rCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Rigid</div>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Component Hierarchy
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {rootNode ? (
            <SPQRNodeItem
              node={rootNode}
              tree={spqrTree}
              depth={0}
              onHighlight={onHighlightComponent}
              onClear={onClearHighlight}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No decomposition available
            </div>
          )}

          {/* Also show non-root nodes that aren't children */}
          {Array.from(spqrTree.nodes.values())
            .filter(node => node.id !== spqrTree.root && !Array.from(spqrTree.nodes.values()).some(n => n.children.includes(node.id)))
            .map(node => (
              <SPQRNodeItem
                key={node.id}
                node={node}
                tree={spqrTree}
                depth={0}
                onHighlight={onHighlightComponent}
                onClear={onClearHighlight}
              />
            ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-border">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-s" />
            <span className="text-muted-foreground">S-node: Critical path (single point of failure)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-p" />
            <span className="text-muted-foreground">P-node: Redundant (multiple alternatives)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-r" />
            <span className="text-muted-foreground">R-node: Complex rigid structure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
