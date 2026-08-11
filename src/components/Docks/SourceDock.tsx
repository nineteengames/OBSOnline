import type { OBSSceneItem } from '../../types/obs';
import { Eye, EyeOff, Lock, Unlock, MonitorPlay, Camera, Image, Globe } from 'lucide-react';

interface Props {
  items: OBSSceneItem[];
  onToggleVisibility: (id: number, enabled: boolean) => void;
  onToggleLock: (id: number, locked: boolean) => void;
  onDoubleClick?: (itemName: string) => void;
}

export function SourceDock({ items, onToggleVisibility, onToggleLock, onDoubleClick }: Props) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'INPUT_VIDEO': return <Camera className="w-[14px] h-[14px] text-obs-text" />;
      case 'INPUT_BROWSER': return <Globe className="w-[14px] h-[14px] text-obs-text" />;
      case 'INPUT_MEDIA': return <Image className="w-[14px] h-[14px] text-obs-text" />;
      default: return <MonitorPlay className="w-[14px] h-[14px] text-obs-text" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#111111] p-0.5">
      {items.map(item => (
        <div 
          key={item.sceneItemId} 
          onDoubleClick={() => onDoubleClick && onDoubleClick(item.sourceName)}
          className="flex items-center gap-1.5 px-1 py-[2px] text-obs-text group cursor-default hover:bg-obs-buttonHover select-none"
        >
          <button 
            onClick={() => onToggleVisibility(item.sceneItemId, !item.sceneItemEnabled)}
            className="text-obs-textLight hover:text-white"
          >
            {item.sceneItemEnabled ? <Eye className="w-[14px] h-[14px]" /> : <EyeOff className="w-[14px] h-[14px] opacity-30" />}
          </button>
          
          <button 
            onClick={() => onToggleLock(item.sceneItemId, !item.sceneItemLocked)}
            className="text-obs-textLight hover:text-white"
            data-locked={item.sceneItemLocked}
          >
            {item.sceneItemLocked ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px] opacity-0 group-hover:opacity-100" />}
          </button>
          
          {getIcon(item.sourceType)}
          
          <span className={`truncate flex-1 text-xs ml-1 ${!item.sceneItemEnabled ? 'opacity-50 text-[#888888]' : ''}`}>
            {item.sourceName}
          </span>
        </div>
      ))}
    </div>
  );
}
