import { useState } from 'react';
import { useOBSWebSocket } from './hooks/useOBSWebSocket';
import { ConnectionModal } from './components/ConnectionModal';
import { SourceDock } from './components/Docks/SourceDock';
import { AudioMixerDock } from './components/Docks/AudioMixerDock';
import { ControlsDock } from './components/Docks/ControlsDock';
import { TransitionsDock } from './components/Docks/TransitionsDock';
import { StatusBar } from './components/StatusBar';
import { SourcePropertiesModal } from './components/SourcePropertiesModal';
import { TopMenu } from './components/TopMenu';
import { SortableDock } from './components/Docks/SortableDock';

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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

type DockId = 'scenes' | 'sources' | 'audio' | 'transitions' | 'controls';

function App() {
  const obs = useOBSWebSocket();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  const [dockVisibility, setDockVisibility] = useState<Record<DockId, boolean>>({
    scenes: true,
    sources: true,
    audio: true,
    transitions: true,
    controls: true,
  });

  const [dockOrder, setDockOrder] = useState<DockId[]>([
    'scenes', 'sources', 'audio', 'transitions', 'controls'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDockOrder((items) => {
        const oldIndex = items.indexOf(active.id as DockId);
        const newIndex = items.indexOf(over.id as DockId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleDock = (dock: DockId) => {
    setDockVisibility(prev => ({ ...prev, [dock]: !prev[dock] }));
  };

  if (!obs.isConnected) {
    return (
      <div className="w-screen h-screen bg-obs-bg text-obs-text font-sans">
        <ConnectionModal onConnect={obs.connect} />
      </div>
    );
  }

  const renderDock = (id: DockId) => {
    switch (id) {
      case 'scenes':
        return (
          <SortableDock key={id} id={id} title="Scenes" widthClass="w-56 min-w-[150px]">
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
              {obs.scenes.map(scene => {
                const isProgram = obs.currentScene === scene.sceneName;
                const isPreview = obs.isStudioModeEnabled && obs.previewScene === scene.sceneName;
                return (
                  <div 
                    key={scene.sceneName} 
                    onClick={() => obs.isStudioModeEnabled ? obs.updatePreviewScene(scene.sceneName) : obs.setProgramScene(scene.sceneName)}
                    className={`px-2 py-1 text-xs cursor-pointer transition-none ${isProgram ? 'bg-obs-accent text-white' : isPreview ? 'bg-obs-border text-white' : 'text-obs-text hover:bg-obs-buttonHover'}`}
                  >
                    {scene.sceneName}
                  </div>
                );
              })}
            </div>
            <div className="h-7 bg-obs-dock border-t border-obs-border flex items-center px-1 gap-1">
               <div className="w-5 h-5 flex items-center justify-center text-obs-text hover:bg-obs-buttonHover cursor-pointer font-bold">+</div>
               <div className="w-5 h-5 flex items-center justify-center text-obs-text hover:bg-obs-buttonHover cursor-pointer font-bold">-</div>
            </div>
          </SortableDock>
        );
      case 'sources':
        return (
          <SortableDock key={id} id={id} title="Sources" widthClass="w-64 min-w-[200px]">
            <div className="flex-1 overflow-hidden custom-scrollbar bg-obs-dock">
              <SourceDock 
                items={obs.sceneItems} 
                onToggleVisibility={obs.setItemEnabled} 
                onToggleLock={obs.setItemLocked}
                onDoubleClick={(itemName) => setSelectedSource(itemName)}
              />
            </div>
            <div className="h-7 bg-obs-dock border-t border-obs-border flex items-center px-1 gap-1">
               <div className="w-5 h-5 flex items-center justify-center text-obs-text hover:bg-obs-buttonHover cursor-pointer font-bold">+</div>
               <div className="w-5 h-5 flex items-center justify-center text-obs-text hover:bg-obs-buttonHover cursor-pointer font-bold">-</div>
               <div className="w-5 h-5 flex items-center justify-center text-obs-text hover:bg-obs-buttonHover cursor-pointer font-bold ml-auto text-[10px]">⚙</div>
            </div>
          </SortableDock>
        );
      case 'audio':
        return (
          <SortableDock key={id} id={id} title="Audio Mixer" flexClass="flex-1 min-w-[300px]">
            <div className="flex-1 overflow-hidden custom-scrollbar bg-obs-dock p-1 flex flex-col">
              <AudioMixerDock 
                inputs={obs.audioInputs} 
                filtersMap={obs.audioFilters}
                inputPropertiesMap={obs.inputPropertiesMap}
                onToggleMute={obs.setInputMute} 
                onVolumeChange={obs.setInputVolume}
                onToggleFilter={obs.toggleAudioFilter}
                onUpdateSettings={obs.updateAudioFilterSettings}
                onUpdateInputSettings={obs.updateInputSettings}
                subscribeToMeter={obs.subscribeToMeter}
              />
            </div>
          </SortableDock>
        );
      case 'transitions':
        return (
          <SortableDock key={id} id={id} title="Scene Transitions" widthClass="w-40 min-w-[120px]">
             <TransitionsDock 
                transitions={obs.transitions}
                currentTransition={obs.currentTransition}
                onSetTransition={obs.setTransition}
                isStudioModeEnabled={obs.isStudioModeEnabled}
                onTransition={obs.triggerStudioModeTransition}
             />
          </SortableDock>
        );
      case 'controls':
        return (
          <SortableDock key={id} id={id} title="Controls" widthClass="w-44 min-w-[150px]">
            <div className="flex-1 overflow-y-auto">
              <ControlsDock 
                isRecording={obs.isRecording}
                isStreaming={obs.isStreaming}
                isVirtualCam={obs.isVirtualCam}
                onToggleRecording={obs.toggleRecording}
                onToggleStreaming={obs.toggleStreaming}
                onToggleVirtualCam={obs.toggleVirtualCam}
                isStudioModeEnabled={obs.isStudioModeEnabled}
                onToggleStudioMode={obs.toggleStudioMode}
              />
            </div>
          </SortableDock>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-obs-bg flex flex-col overflow-hidden text-obs-text text-sm font-sans selection:bg-obs-accent selection:text-white">
      {/* Top Menu Bar */}
      <TopMenu 
        dockVisibility={dockVisibility} 
        onToggleDock={toggleDock} 
        onDisconnect={obs.disconnect} 
      />

      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0 flex flex-col relative bg-obs-bg p-2">
        <div className={`w-full h-full flex gap-2 ${obs.isStudioModeEnabled ? 'justify-between' : 'justify-center'}`}>
          
          {/* Preview Canvas */}
          {obs.isStudioModeEnabled && (
            <div className="flex-1 h-full flex flex-col relative group">
              <div className="text-center text-xs text-obs-text bg-obs-header py-1 font-semibold tracking-wider mb-1 border border-obs-border">Preview</div>
              <div className="flex-1 bg-black border border-obs-border relative overflow-hidden flex items-center justify-center">
                 <div className="text-obs-border font-mono text-3xl font-bold tracking-widest pointer-events-none select-none">
                  {obs.previewScene.toUpperCase()}
                 </div>
              </div>
            </div>
          )}

          {/* Program Canvas */}
          <div className="flex-1 h-full flex flex-col relative group max-w-full">
            {obs.isStudioModeEnabled && (
              <div className="text-center text-xs text-obs-text bg-obs-header py-1 font-semibold tracking-wider mb-1 border border-obs-border">Program</div>
            )}
            <div className="flex-1 bg-black border border-obs-border relative overflow-hidden flex items-center justify-center">
              {obs.previewImage ? (
                <img 
                  src={obs.previewImage} 
                  alt="Live Preview" 
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              ) : (
                <div className="text-obs-border font-mono text-3xl font-bold tracking-widest pointer-events-none select-none">
                  {obs.currentScene.toUpperCase()}
                </div>
              )}
              
              {/* Overlay Indicators */}
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-obs-header/80 px-2 py-1 border border-obs-border text-[10px] text-obs-text">
                <div className="flex items-center gap-1 font-medium">
                  <div className={`w-2 h-2 rounded-full ${obs.isRecording ? 'bg-obs-red animate-pulse' : 'bg-gray-500'}`} />
                  REC
                </div>
                <div className="w-px h-3 bg-obs-border" />
                <div className="flex items-center gap-1 font-medium">
                  <div className={`w-2 h-2 rounded-full ${obs.isStreaming ? 'bg-obs-green animate-pulse' : 'bg-gray-500'}`} />
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docks Area */}
      <div className="h-[280px] flex border-t border-obs-border bg-obs-bg overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dockOrder}
            strategy={horizontalListSortingStrategy}
          >
            {dockOrder.filter(id => dockVisibility[id]).map(id => renderDock(id))}
          </SortableContext>
        </DndContext>
      </div>

      <StatusBar 
        cpuUsage={obs.obsStats.cpuUsage} 
        memoryUsage={obs.obsStats.memoryUsage}
        activeFps={obs.obsStats.activeFps}
        isRecording={obs.isRecording}
        isStreaming={obs.isStreaming}
      />
      
      {selectedSource && (
        <SourcePropertiesModal 
          sourceName={selectedSource} 
          onClose={() => setSelectedSource(null)}
          getInputSettings={obs.getInputSettings}
          updateInputSettings={obs.updateInputSettings}
        />
      )}
    </div>
  );
}

export default App;
