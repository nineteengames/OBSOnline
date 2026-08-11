import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Props {
  inputName: string;
  settings: Record<string, any>;
  propertyItems: Record<string, { itemName: string; itemValue: any }[]>;
  onUpdateSettings: (inputName: string, settings: Record<string, any>) => void;
  onClose: () => void;
}

export function InputSettingsModal({ inputName, settings, propertyItems, onUpdateSettings, onClose }: Props) {
  const [localSettings, setLocalSettings] = useState(settings || {});

  const handleChange = (key: string, value: any, type: string) => {
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }
    setLocalSettings(prev => ({ ...prev, [key]: parsedValue }));
  };

  const handleSave = () => {
    onUpdateSettings(inputName, localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[450px] bg-obs-dark border border-obs-border rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-obs-border flex items-center justify-between bg-obs-light rounded-t-lg">
          <h2 className="text-sm font-semibold text-obs-text">Properties for '{inputName}'</h2>
          <button onClick={onClose} className="text-obs-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {Object.keys(localSettings).length === 0 ? (
            <div className="text-sm text-obs-muted text-center py-4">No settings available.</div>
          ) : (
            <div className="flex flex-col gap-3 p-3 bg-obs-light border border-obs-border rounded text-sm">
              {Object.entries(localSettings).map(([key, value]) => {
                const type = typeof value;
                const options = propertyItems[key]; // Check if we have dropdown options for this setting

                // Render Dropdown if options exist
                if (options && options.length > 0) {
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-obs-muted text-xs capitalize">{key.replace(/_/g, ' ')}</label>
                      <select
                        value={value}
                        onChange={e => handleChange(key, e.target.value, 'string')}
                        className="bg-obs-dark border border-obs-border rounded px-2 py-1.5 text-xs text-obs-text focus:outline-none focus:border-obs-active"
                      >
                        {options.map(opt => (
                          <option key={opt.itemValue} value={opt.itemValue}>
                            {opt.itemName}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Render Checkbox
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
                
                // Render Text / Number
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-obs-muted text-xs capitalize">{key.replace(/_/g, ' ')}</label>
                    <input 
                      type={type === 'number' ? 'number' : 'text'}
                      step={type === 'number' ? 'any' : undefined}
                      value={value}
                      onChange={e => handleChange(key, e.target.value, type)}
                      className="bg-obs-dark border border-obs-border rounded px-2 py-1 text-obs-text focus:outline-none focus:border-obs-active"
                    />
                  </div>
                );
              })}
              
              <button 
                onClick={handleSave}
                className="mt-4 flex items-center justify-center gap-2 bg-obs-active hover:bg-blue-600 text-white py-1.5 rounded transition-colors text-xs font-medium"
              >
                <Save className="w-3 h-3" />
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
