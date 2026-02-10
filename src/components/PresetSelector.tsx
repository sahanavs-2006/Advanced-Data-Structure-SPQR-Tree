import React from 'react';
import { NetworkPreset } from '@/types/graph';
import { cn } from '@/lib/utils';

interface PresetSelectorProps {
  presets: NetworkPreset[];
  selectedPresetId: string | null;
  onSelectPreset: (preset: NetworkPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
        Network Templates
      </h3>
      <div className="space-y-1">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
              'hover:bg-accent',
              selectedPresetId === preset.id 
                ? 'bg-primary/10 border border-primary/30' 
                : 'bg-transparent border border-transparent'
            )}
          >
            <span className="text-2xl">{preset.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                selectedPresetId === preset.id && 'text-primary'
              )}>
                {preset.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {preset.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
