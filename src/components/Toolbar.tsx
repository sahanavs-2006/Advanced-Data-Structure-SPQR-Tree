import React from 'react';
import { ToolMode } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer2, Plus, Link2, Trash2, Zap, RotateCcw, Sparkles, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  onReset: () => void;
  onAnalyze: () => void;
  onAutoLayout: () => void;
  isAnalyzing?: boolean;
}

const tools: { mode: ToolMode; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { mode: 'select', icon: <MousePointer2 className="w-4 h-4" />, label: 'Select & Move', shortcut: 'V' },
  { mode: 'addNode', icon: <Plus className="w-4 h-4" />, label: 'Add Node', shortcut: 'N' },
  { mode: 'addEdge', icon: <Link2 className="w-4 h-4" />, label: 'Add Edge', shortcut: 'E' },
  { mode: 'delete', icon: <Trash2 className="w-4 h-4" />, label: 'Delete', shortcut: 'D' },
  { mode: 'simulate', icon: <Zap className="w-4 h-4" />, label: 'Simulate Failure', shortcut: 'S' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  onToolModeChange,
  onReset,
  onAnalyze,
  onAutoLayout,
  isAnalyzing
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-card/80 backdrop-blur-sm border border-border rounded-xl">
      {tools.map(tool => (
        <Tooltip key={tool.mode}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToolModeChange(tool.mode)}
              className={cn(
                'h-9 w-9 p-0 transition-all duration-200',
                toolMode === tool.mode && 'bg-primary/20 text-primary glow-border'
              )}
            >
              {tool.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover border-border">
            <p className="font-medium">{tool.label}</p>
            <p className="text-xs text-muted-foreground">Press {tool.shortcut}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="w-px h-6 bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoLayout}
            className="h-9 w-9 p-0 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Magic Layout (Planar-Optimized)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 w-9 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Reset Graph</p>
        </TooltipContent>
      </Tooltip>

      <Button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="btn-cyber h-9 px-4 ml-2 text-sm"
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Analyze
          </span>
        )}
      </Button>
    </div>
  );
};
