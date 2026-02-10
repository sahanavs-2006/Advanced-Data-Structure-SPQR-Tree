import React from 'react';
import { Graph, AnalysisResult } from '@/types/graph';
import { Waypoints, Link2, AlertTriangle, Shield } from 'lucide-react';

interface StatsBarProps {
  graph: Graph;
  analysisResult: AnalysisResult | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ graph, analysisResult }) => {
  const stats = [
    {
      icon: <Waypoints className="w-4 h-4" />,
      label: 'Nodes',
      value: graph.nodes.length,
      color: 'text-primary'
    },
    {
      icon: <Link2 className="w-4 h-4" />,
      label: 'Edges',
      value: graph.edges.length,
      color: 'text-primary'
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Bridges',
      value: analysisResult?.bridges.length ?? '-',
      color: analysisResult && analysisResult.bridges.length > 0 ? 'text-critical' : 'text-success'
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: 'Redundancy',
      value: analysisResult ? `${analysisResult.redundancyScore}%` : '-',
      color: analysisResult 
        ? analysisResult.redundancyScore >= 80 ? 'text-success' 
          : analysisResult.redundancyScore >= 50 ? 'text-warning' 
          : 'text-critical'
        : 'text-muted-foreground'
    }
  ];

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-card/50 backdrop-blur-sm border-t border-border">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={stat.color}>{stat.icon}</span>
          <span className="text-xs text-muted-foreground">{stat.label}:</span>
          <span className={`text-sm font-mono font-semibold ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};
