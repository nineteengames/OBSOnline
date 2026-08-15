import { Button } from "../ui/button";

interface Props {
  isRecording: boolean;
  isStreaming: boolean;
  isVirtualCam: boolean;
  isStudioModeEnabled: boolean;
  recordTimecode: string;
  streamTimecode: string;
  onToggleRecording: () => void;
  onToggleStreaming: () => void;
  onToggleVirtualCam: () => void;
  onToggleStudioMode: () => void;
}

export function ControlsDock({
  isRecording,
  isStreaming,
  isVirtualCam,
  isStudioModeEnabled,
  recordTimecode,
  streamTimecode,
  onToggleRecording,
  onToggleStreaming,
  onToggleVirtualCam,
  onToggleStudioMode
}: Props) {
  
  const baseButtonClass = "w-full justify-start h-7 text-[13px] font-normal rounded-sm bg-obs-button hover:bg-obs-buttonHover text-obs-textLight border-transparent px-2";
  
  return (
    <div className="flex flex-col p-1 gap-[2px] bg-obs-dock h-full">
      <Button 
        variant="default"
        onClick={onToggleStreaming}
        className={`${baseButtonClass} ${isStreaming ? 'bg-obs-green hover:bg-green-600 text-white' : ''}`}
      >
        <div className="flex w-full justify-between items-center">
          <span>{isStreaming ? 'Stop Streaming' : 'Start Streaming'}</span>
          {isStreaming && streamTimecode && <span className="text-[10px] font-mono text-white/90">{streamTimecode.split('.')[0]}</span>}
        </div>
      </Button>
      
      <Button 
        variant="default"
        onClick={onToggleRecording}
        className={`${baseButtonClass} ${isRecording ? 'bg-obs-red hover:bg-red-600 text-white' : ''}`}
      >
        <div className="flex w-full justify-between items-center">
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          {isRecording && recordTimecode && <span className="text-[10px] font-mono text-white/90">{recordTimecode.split('.')[0]}</span>}
        </div>
      </Button>
      
      <Button 
        variant="default"
        onClick={onToggleVirtualCam}
        className={`${baseButtonClass} ${isVirtualCam ? 'bg-obs-accent hover:bg-obs-accentHover text-white' : ''}`}
      >
        <span>{isVirtualCam ? 'Stop Virtual Camera' : 'Start Virtual Camera'}</span>
      </Button>

      <Button 
        variant="default"
        onClick={onToggleStudioMode}
        className={`${baseButtonClass} ${isStudioModeEnabled ? 'bg-obs-buttonActive' : ''}`}
      >
        <span>Studio Mode</span>
      </Button>
      
      <Button 
        variant="default"
        className={baseButtonClass}
      >
        <span>Settings</span>
      </Button>

      <Button 
        variant="default"
        className={baseButtonClass}
      >
        <span>Exit</span>
      </Button>
    </div>
  );
}
