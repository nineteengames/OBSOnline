import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onAdd: (name: string, kind: string) => Promise<void>;
  inputKinds: { value: string, label: string }[];
}

const FALLBACK_KINDS = [
  { value: 'dshow_input', label: 'Video Capture Device' },
  { value: 'browser_source', label: 'Browser' },
  { value: 'image_source', label: 'Image' },
  { value: 'ffmpeg_source', label: 'Media Source' },
  { value: 'color_source_v3', label: 'Color Source' },
  { value: 'text_gdiplus_v2', label: 'Text (GDI+)' },
  { value: 'window_capture', label: 'Window Capture' },
  { value: 'monitor_capture', label: 'Display Capture' },
];

export function AddSourceModal({ onClose, onAdd, inputKinds }: Props) {
  const kindsToUse = inputKinds.length > 0 ? inputKinds : FALLBACK_KINDS;
  const [name, setName] = useState('');
  const [kind, setKind] = useState(kindsToUse[0]?.value || 'dshow_input');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setLoading(true);
      setError(null);
      try {
        await onAdd(name.trim(), kind);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to create source. Name might already exist.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-obs-bg border border-obs-border rounded-lg shadow-2xl w-[400px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-obs-border bg-obs-header">
          <h2 className="text-sm font-semibold text-white">Add Source</h2>
          <button onClick={onClose} className="text-obs-textLight hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-obs-textLight">Source Type</label>
            <select 
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="bg-[#111111] border border-obs-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-obs-accent"
            >
              {kindsToUse.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-obs-textLight">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="bg-[#111111] border border-obs-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-obs-accent placeholder-gray-500"
              placeholder="Enter source name"
            />
          </div>

          {error && <div className="text-obs-red text-xs">{error}</div>}

          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-1.5 text-sm rounded bg-obs-button hover:bg-obs-buttonHover text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || loading}
              className="px-4 py-1.5 text-sm rounded bg-obs-accent hover:bg-opacity-80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
