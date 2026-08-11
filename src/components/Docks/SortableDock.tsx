import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  title: string;
  children: React.ReactNode;
  widthClass?: string;
  flexClass?: string;
}

export function SortableDock({ id, title, children, widthClass = '', flexClass = '' }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${widthClass} ${flexClass} border-r border-obs-border flex flex-col bg-obs-dock`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="px-2 py-1 text-[11px] font-semibold text-obs-text bg-obs-header border-b border-obs-border flex justify-between items-center cursor-grab active:cursor-grabbing"
      >
        {title}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
