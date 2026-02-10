import React from 'react';
import { Network } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-border">
          <Network className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Critical Infrastructure</span>
            <span className="text-foreground"> Robustness Analysis</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-80">
            Structural Integrity Evaluation Using SPQR Trees
          </p>
        </div>
      </div>

    </header>
  );
};
