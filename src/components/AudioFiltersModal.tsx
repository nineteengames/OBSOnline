import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Save } from 'lucide-react';
import type { OBSFilter } from '../types/obs';

interface Props {
  inputName: string;
  filters: OBSFilter[];
  onToggleFilter: (filterName: string, enabled: boolean) => void;
  onUpdateSettings: (filterName: string, settings: Record<string, any>) => void;
  onClose: () => void;
}

function DynamicForm({ 
  settings, 
  onSave 
}: { 
  settings: Record<string, any>, 
  onSave: (newSettings: Record<string, any>) => void 
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key: string, value: any, type: string) => {
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }
    setLocalSettings(prev => ({ ...prev, [key]: parsedValue }));
  };

  return (
    <div className="flex flex-col gap-3 mt-3 p-3 bg-obs-light border border-obs-border rounded text-sm">
      {Object.entries(localSettings).map(([key, value]) => {
        const type = typeof value;
        if (type === 'boolean') {
          return (
            <div key={key} className="flex items-center justify-between">
              <label className="text-obs-muted capitalize">{key.replace(/_/g, ' ')}</label>
              <input 
                type="checkbox" 
                checked={value}
                onChange={e => handleChange(key, e.target.checked, 'boolean')}
                className="accent-obs-active"
              />
            </div>
          );
        }
        
        if (type === 'number') {
          // Guess ranges based on common OBS filter properties
          let min = 0;
          let max = 100;
          if (key.includes('threshold') || key.includes('gain') || key.includes('volume')) {
            min = -60; max = 30;
          } else if (key.includes('ratio')) {
            min = 1; max = 32;
          } else if (key.includes('time') || key.includes('delay')) {
            min = 1; max = 2000;
          }
          
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className="text-obs-muted text-xs capitalize">{key.replace(/_/g, ' ')}</label>
                <input 
                  type="number"
                  step="any"
                  value={value}
                  onChange={e => handleChange(key, e.target.value, type)}
                  className="bg-transparent text-right text-xs text-obs-text w-16 focus:outline-none"
                />
              </div>
              <input 
                type="range"
                min={min}
                max={max}
                step={max > 100 ? 1 : 0.1}
                value={value}
                onChange={e => handleChange(key, e.target.value, type)}
                className="w-full h-1.5 bg-obs-dark border border-obs-border rounded-lg appearance-none cursor-pointer accent-obs-active"
              />
            </div>
          );
        }
        
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-obs-muted text-xs capitalize">{key.replace(/_/g, ' ')}</label>
            <input 
              type="text"
              value={value}
              onChange={e => handleChange(key, e.target.value, type)}
              className="bg-obs-dark border border-obs-border rounded px-2 py-1 text-obs-text focus:outline-none focus:border-obs-active"
            />
          </div>
        );
      })}
      
      <button 
        onClick={() => onSave(localSettings)}
        className="mt-2 flex items-center justify-center gap-2 bg-obs-active hover:bg-blue-600 text-white py-1.5 rounded transition-colors text-xs font-medium"
      >
        <Save className="w-3 h-3" />
        Save Settings
      </button>
    </div>
  );
}

export function AudioFiltersModal({ inputName, filters, onToggleFilter, onUpdateSettings, onClose }: Props) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[450px] bg-obs-dark border border-obs-border rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-obs-border flex items-center justify-between bg-obs-light rounded-t-lg">
          <h2 className="text-sm font-semibold text-obs-text">Filters for '{inputName}'</h2>
          <button onClick={onClose} className="text-obs-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2 overflow-y-auto">
          {filters.length === 0 ? (
            <div className="text-sm text-obs-muted text-center py-4">No filters applied.</div>
          ) : (
            filters.map(filter => {
              const isExpanded = expandedFilter === filter.filterName;
              return (
                <div key={filter.filterName} className="flex flex-col bg-[#212124] border border-obs-border rounded overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer select-none flex-1"
                      onClick={() => setExpandedFilter(isExpanded ? null : filter.filterName)}
                    >
                      <button className="text-obs-muted hover:text-obs-text">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm text-obs-text font-medium">{filter.filterName}</span>
                        <span className="text-[10px] text-obs-muted">{filter.filterKind}</span>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={filter.filterEnabled}
                        onChange={(e) => onToggleFilter(filter.filterName, e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-obs-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-obs-active"></div>
                    </label>
                  </div>
                  
                  {isExpanded && filter.filterSettings && (
                    <div className="px-3 pb-3 pt-1 border-t border-obs-border/50">
                      <DynamicForm 
                        settings={filter.filterSettings} 
                        onSave={(newSettings) => {
                          onUpdateSettings(filter.filterName, newSettings);
                          // Optionally collapse on save: setExpandedFilter(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
