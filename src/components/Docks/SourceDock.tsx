import { useState, useMemo } from 'react';
import type { OBSSceneItem } from '../../types/obs';
import { Eye, EyeOff, Lock, Unlock, MonitorPlay, Camera, Image, Globe, GripVertical, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  items: OBSSceneItem[];
  onToggleVisibility: (id: number, enabled: boolean) => void;
  onToggleLock: (id: number, locked: boolean) => void;
  onDoubleClick?: (itemName: string) => void;
  selectedItem?: string | null;
  onSelect?: (itemName: string) => void;
  onReorder?: (sceneItemId: number, newIndex: number) => void;
}

const getIcon = (type: string, isGroup?: boolean) => {
  if (isGroup) return <Folder className="w-[14px] h-[14px] text-obs-text" />;
  switch (type) {
    case 'INPUT_VIDEO': return <Camera className="w-[14px] h-[14px] text-obs-text" />;
    case 'INPUT_BROWSER': return <Globe className="w-[14px] h-[14px] text-obs-text" />;
    case 'INPUT_MEDIA': return <Image className="w-[14px] h-[14px] text-obs-text" />;
    default: return <MonitorPlay className="w-[14px] h-[14px] text-obs-text" />;
  }
};

function SortableItem({ item, onToggleVisibility, onToggleLock, onDoubleClick, selectedItem, onSelect, expandedGroups, onToggleGroup }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.sceneItemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedItem === item.sourceName;
  const isExpanded = expandedGroups?.[item.sceneItemId];

  return (
    <div className="flex flex-col" ref={setNodeRef} style={style}>
      <div
        onClick={() => {
          if (item.isGroup) onToggleGroup(item.sceneItemId);
          if (onSelect) onSelect(item.sourceName);
        }}
        onDoubleClick={() => !item.isGroup && onDoubleClick && onDoubleClick(item.sourceName)}
        className={`flex items-center gap-1.5 px-1 py-[2px] text-obs-text group cursor-default select-none ${isSelected ? 'bg-obs-accent text-white' : 'hover:bg-obs-buttonHover'}`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(item.sceneItemId, !item.sceneItemEnabled); }}
          className={`${isSelected ? 'text-white' : 'text-obs-textLight hover:text-white'}`}
        >
          {item.sceneItemEnabled ? <Eye className="w-[14px] h-[14px]" /> : <EyeOff className="w-[14px] h-[14px] opacity-30" />}
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleLock(item.sceneItemId, !item.sceneItemLocked); }}
          className={`${isSelected ? 'text-white' : 'text-obs-textLight hover:text-white'}`}
          data-locked={item.sceneItemLocked}
        >
          {item.sceneItemLocked ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px] opacity-0 group-hover:opacity-100" />}
        </button>
        
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-white/10 rounded">
          <GripVertical className="w-[12px] h-[14px] opacity-50" />
        </div>

        {item.isGroup && (
          <div className="w-[14px] flex items-center justify-center">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>
        )}

        {getIcon(item.sourceType, item.isGroup)}
        
        <span className={`truncate flex-1 text-xs ml-1 ${!item.sceneItemEnabled ? 'opacity-50 text-[#888888]' : ''} ${isSelected ? 'text-white' : ''}`}>
          {item.sourceName}
        </span>
      </div>

      {item.isGroup && isExpanded && item.children && (
        <div className="flex flex-col pr-1 py-1 border-l border-obs-border/30 ml-[26px] pl-1 gap-0.5 bg-black/10">
          {item.children.map((child: any) => {
             const childSelected = selectedItem === child.sourceName;
             return (
               <div 
                 key={child.sceneItemId} 
                 className={`flex items-center gap-1.5 px-1 py-[2px] text-obs-text select-none cursor-default ${childSelected ? 'bg-obs-accent text-white' : 'hover:bg-obs-buttonHover'}`}
                 onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(child.sourceName); }}
                 onDoubleClick={(e) => { e.stopPropagation(); if (onDoubleClick) onDoubleClick(child.sourceName); }}
               >
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(child.sceneItemId, !child.sceneItemEnabled); }}
                    className={`${childSelected ? 'text-white' : 'text-obs-textLight hover:text-white'}`}
                  >
                    {child.sceneItemEnabled ? <Eye className="w-[14px] h-[14px]" /> : <EyeOff className="w-[14px] h-[14px] opacity-30" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLock(child.sceneItemId, !child.sceneItemLocked); }}
                    className={`${childSelected ? 'text-white' : 'text-obs-textLight hover:text-white'}`}
                  >
                    {child.sceneItemLocked ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px] opacity-0 hover:opacity-100" />}
                  </button>
                  <div className="w-[12px]" />
                  {getIcon(child.sourceType, child.isGroup)}
                  <span className={`truncate flex-1 text-xs ml-1 ${!child.sceneItemEnabled ? 'opacity-50 text-[#888888]' : ''} ${childSelected ? 'text-white' : ''}`}>
                    {child.sourceName}
                  </span>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}

export function SourceDock({ items, onToggleVisibility, onToggleLock, onDoubleClick, selectedItem, onSelect, onReorder }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedItems = useMemo(() => {
    return items ? [...items] : [];
  }, [items]);

  const itemIds = sortedItems.map(i => i.sceneItemId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newIndex = sortedItems.findIndex(i => i.sceneItemId === over.id);
      if (onReorder) {
        // Find the target item to get its original sceneItemIndex (OBS's index format)
        // OBS sceneItemIndex is typically 0 at the bottom, going up. We just swap or set to the target's index.
        const targetItem = sortedItems[newIndex];
        const targetObsIndex = targetItem.sceneItemIndex !== undefined ? targetItem.sceneItemIndex : newIndex;
        onReorder(active.id as number, targetObsIndex);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#111111] p-0.5 custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          {sortedItems.map(item => (
            <SortableItem 
              key={item.sceneItemId} 
              item={item} 
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onDoubleClick={onDoubleClick}
              selectedItem={selectedItem}
              onSelect={onSelect}
              expandedGroups={expandedGroups}
              onToggleGroup={(id: number) => setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
