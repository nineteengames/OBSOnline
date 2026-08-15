import { useState, useRef, useEffect } from 'react';

interface Props {
  dockVisibility: {
    scenes: boolean;
    sources: boolean;
    audio: boolean;
    transitions: boolean;
    controls: boolean;
  };
  onToggleDock: (dock: keyof Props['dockVisibility']) => void;
  onDisconnect: () => void;
}

export function TopMenu({ dockVisibility, onToggleDock, onDisconnect }: Props) {
  const [activeMenu, setActiveMenu] = useState<'file' | 'view' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: 'file' | 'view') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMouseEnter = (menu: 'file' | 'view') => {
    if (activeMenu) {
      setActiveMenu(menu);
    }
  };

  return (
    <div className="h-7 bg-obs-header flex items-center px-2 text-xs gap-1 text-obs-text select-none border-b border-obs-border" ref={menuRef}>
      <div className="font-semibold px-2 mr-2">OBSOnline</div>
      
      {/* File Menu */}
      <div className="relative">
        <div 
          className={`px-2 py-1 cursor-default ${activeMenu === 'file' ? 'bg-obs-accent text-white' : 'hover:bg-obs-buttonHover'}`}
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMouseEnter('file')}
        >
          File
        </div>
        {activeMenu === 'file' && (
          <div className="absolute top-full left-0 mt-0 bg-[#2b2b2b] border border-obs-border shadow-lg min-w-[150px] z-50 flex flex-col py-1">
            <div 
              className="px-6 py-1 hover:bg-obs-accent hover:text-white cursor-pointer"
              onClick={() => {
                setActiveMenu(null);
                onDisconnect();
              }}
            >
              Disconnect
            </div>
            <div className="h-px bg-obs-border my-1" />
            <div 
              className="px-6 py-1 hover:bg-obs-accent hover:text-white cursor-pointer"
              onClick={() => window.close()}
            >
              Exit
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <div 
          className={`px-2 py-1 cursor-default ${activeMenu === 'view' ? 'bg-obs-accent text-white' : 'hover:bg-obs-buttonHover'}`}
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMouseEnter('view')}
        >
          View
        </div>
        {activeMenu === 'view' && (
          <div className="absolute top-full left-0 mt-0 bg-[#2b2b2b] border border-obs-border shadow-lg min-w-[200px] z-50 flex flex-col py-1">
            <div className="px-3 py-1 text-obs-textLight font-semibold text-[11px] uppercase tracking-wider mb-1">Docks</div>
            
            {(Object.keys(dockVisibility) as Array<keyof Props['dockVisibility']>).map(dock => (
              <div 
                key={dock}
                className="px-2 py-1 hover:bg-obs-accent hover:text-white cursor-pointer flex items-center gap-2"
                onClick={() => {
                  onToggleDock(dock);
                  // Don't close menu to allow toggling multiple
                }}
              >
                <div className="w-4 flex justify-center">
                  {dockVisibility[dock] && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className="capitalize">{dock === 'audio' ? 'Audio Mixer' : dock}</span>
              </div>
            ))}
            
            <div className="h-px bg-obs-border my-1" />
            
            <div 
              className="px-6 py-1 hover:bg-obs-accent hover:text-white cursor-pointer"
              onClick={() => {
                setActiveMenu(null);
                // Reset UI logic would go here
              }}
            >
              Reset UI
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
