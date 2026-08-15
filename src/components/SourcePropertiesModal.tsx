import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SourcePropertiesModalProps {
  sourceName: string | null;
  onClose: () => void;
  getInputSettings: (inputName: string) => Promise<{ inputSettings: Record<string, any>, inputKind: string, propertyLists?: Record<string, any[]> } | null>;
  updateInputSettings: (inputName: string, settings: Record<string, any>) => void;
}

export const SourcePropertiesModal: React.FC<SourcePropertiesModalProps> = ({
  sourceName,
  onClose,
  getInputSettings,
  updateInputSettings
}) => {
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [propertyLists, setPropertyLists] = useState<Record<string, any[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sourceName) {
      setLoading(true);
      getInputSettings(sourceName).then(data => {
        if (data) {
          setSettings(data.inputSettings);
          setPropertyLists(data.propertyLists || null);
        }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceName]);

  const handleChange = (key: string, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSave = () => {
    if (sourceName && settings) {
      updateInputSettings(sourceName, settings);
    }
    onClose();
  };

  if (!sourceName) return null;

  return (
    <Dialog open={!!sourceName} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-obs-dock border-obs-border text-obs-text p-0 shadow-2xl rounded-none">
        <DialogHeader className="p-3 border-b border-obs-border bg-[#1a1a1a]">
          <DialogTitle className="text-[13px] font-semibold text-white tracking-wide">Properties for '{sourceName}'</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-3">
          {loading ? (
            <div className="text-xs text-obs-muted text-center py-4">Loading properties...</div>
          ) : settings && Object.keys(settings).length > 0 ? (
            Object.entries(settings).map(([key, value]) => {
              const id = `prop-${key}`;
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <Label htmlFor={id} className="text-[11px] font-medium text-obs-textLight break-words">
                    {key}
                  </Label>
                  {propertyLists && propertyLists[key] ? (
                    <select
                      id={id}
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const selectedItem = propertyLists[key].find(i => i.itemValue?.toString() === e.target.value);
                        handleChange(key, selectedItem !== undefined ? selectedItem.itemValue : e.target.value);
                      }}
                      className="h-7 text-xs bg-[#111111] border border-obs-border rounded-none text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-obs-accent px-1.5 cursor-pointer"
                    >
                      {propertyLists[key].map((item: any, idx: number) => (
                        <option key={idx} value={item.itemValue?.toString()} disabled={item.itemEnabled === false}>
                          {item.itemName}
                        </option>
                      ))}
                    </select>
                  ) : typeof value === 'boolean' ? (
                    <input
                      type="checkbox"
                      id={id}
                      checked={value}
                      onChange={(e) => handleChange(key, e.target.checked)}
                      className="w-3.5 h-3.5 accent-obs-accent cursor-pointer"
                    />
                  ) : typeof value === 'number' ? (
                    <Input
                      id={id}
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                      className="h-7 text-xs bg-[#111111] border-obs-border rounded-none text-white focus-visible:ring-1 focus-visible:ring-obs-accent"
                    />
                  ) : (
                    <Input
                      id={id}
                      type="text"
                      value={value?.toString() || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="h-7 text-xs bg-[#111111] border-obs-border rounded-none text-white focus-visible:ring-1 focus-visible:ring-obs-accent"
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-obs-muted text-center py-4">No configurable properties found for this source.</div>
          )}
        </div>

        <DialogFooter className="p-3 border-t border-obs-border bg-[#1a1a1a] flex justify-end gap-2">
          <Button variant="outline" className="h-7 px-4 text-xs font-medium bg-transparent border border-obs-border hover:bg-[#333333] hover:text-white rounded-sm" onClick={onClose}>
            Cancel
          </Button>
          <Button className="h-7 px-6 text-xs font-medium bg-obs-button hover:bg-obs-buttonHover text-white border border-obs-border rounded-sm" onClick={handleSave}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
