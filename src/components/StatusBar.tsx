import React from 'react';

interface StatusBarProps {
  cpuUsage: number;
  memoryUsage: number;
  activeFps: number;
  isRecording: boolean;
  isStreaming: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cpuUsage,
  memoryUsage,
  activeFps,
  isRecording,
  isStreaming
}) => {
  return (
    <div className="h-6 w-full bg-obs-header border-t border-obs-border flex items-center justify-between px-2 text-[11px] text-obs-text select-none">
      <div className="flex items-center gap-4">
        {isRecording ? (
          <div className="flex items-center gap-1.5 text-obs-textLight">
            <div className="w-2 h-2 rounded-full bg-obs-red" />
            REC: 00:00:00
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-obs-text">
            <div className="w-2 h-2 rounded-full bg-obs-borderLight" />
            REC: 00:00:00
          </div>
        )}
        {isStreaming ? (
          <div className="flex items-center gap-1.5 text-obs-textLight">
            <div className="w-2 h-2 rounded-full bg-obs-green" />
            LIVE: 00:00:00
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-obs-text">
            <div className="w-2 h-2 rounded-full bg-obs-borderLight" />
            LIVE: 00:00:00
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 font-sans">
        <div className="flex items-center gap-1">
          <span>CPU:</span>
          <span className="w-10 text-right">{cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span>MEM:</span>
          <span className="w-12 text-right">{memoryUsage.toFixed(1)}MB</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-10 text-right">{Math.round(activeFps)} fps</span>
        </div>
      </div>
    </div>
  );
};
