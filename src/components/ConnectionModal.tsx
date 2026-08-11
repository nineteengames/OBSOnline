import { useState } from 'react';
import type { ConnectionDetails } from '../hooks/useOBSWebSocket';
import { Settings2, Zap } from 'lucide-react';

interface Props {
  onConnect: (details: ConnectionDetails) => Promise<void>;
}

export function ConnectionModal({ onConnect }: Props) {
  const [ip, setIp] = useState('127.0.0.1');
  const [port, setPort] = useState('4455');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent, isMock: boolean) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');
    try {
      await onConnect({ ip, port, password, isMock });
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[450px] bg-obs-light border border-obs-border rounded-lg shadow-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-obs-border flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-obs-muted" />
          <h2 className="text-sm font-semibold text-obs-text">Connect to OBS Studio</h2>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 flex flex-col gap-4">
          {error && <div className="p-3 bg-obs-red/20 border border-obs-red text-obs-red text-sm rounded">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-obs-muted">WebSocket IP</label>
            <input 
              type="text" 
              value={ip} 
              onChange={e => setIp(e.target.value)}
              className="bg-obs-dark border border-obs-border rounded px-3 py-2 text-sm text-obs-text focus:outline-none focus:border-obs-active"
              placeholder="e.g. 192.168.1.100"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-obs-muted">Port (Default: 4455)</label>
            <input 
              type="text" 
              value={port} 
              onChange={e => setPort(e.target.value)}
              className="bg-obs-dark border border-obs-border rounded px-3 py-2 text-sm text-obs-text focus:outline-none focus:border-obs-active"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-obs-muted">WebSocket Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-obs-dark border border-obs-border rounded px-3 py-2 text-sm text-obs-text focus:outline-none focus:border-obs-active"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button 
              type="submit" 
              disabled={isConnecting}
              className="flex-1 bg-obs-active hover:bg-blue-600 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center justify-center gap-2 flex-1 bg-obs-dark border border-obs-border hover:bg-obs-border text-obs-text text-sm font-medium py-2 rounded transition-colors"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              Demo Mode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
