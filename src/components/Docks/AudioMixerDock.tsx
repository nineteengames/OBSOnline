import { useState } from 'react';
import type { OBSAudioInput, OBSFilter } from '../../types/obs';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { AudioFiltersModal } from '../AudioFiltersModal';
import { InputSettingsModal } from '../InputSettingsModal';
import { AudioMeter } from '../AudioMeter';
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface Props {
  inputs: OBSAudioInput[];
  filtersMap: Record<string, OBSFilter[]>;
  inputPropertiesMap: Record<string, Record<string, { itemName: string, itemValue: any }[]>>;
  onToggleMute: (name: string, unmuted: boolean) => void;
  onVolumeChange: (name: string, volumeMul: number) => void;
  onToggleFilter: (inputName: string, filterName: string, enabled: boolean) => void;
  onUpdateSettings: (inputName: string, filterName: string, settings: Record<string, any>) => void;
  onUpdateInputSettings: (inputName: string, settings: Record<string, any>) => void;
  subscribeToMeter: (inputName: string, cb: (mul: number) => void) => () => void;
}

export function AudioMixerDock({ 
  inputs, 
  filtersMap, 
  inputPropertiesMap,
  onToggleMute, 
  onVolumeChange, 
  onToggleFilter, 
  onUpdateSettings,
  onUpdateInputSettings,
  subscribeToMeter
}: Props) {
  const [activeSettingsInput, setActiveSettingsInput] = useState<string | null>(null);
  const [activePropertiesInput, setActivePropertiesInput] = useState<string | null>(null);
  
  const mulToPercent = (mul: number) => Math.min(100, Math.max(0, Math.round(mul * 100)));
  const percentToMul = (pct: number) => pct / 100;

  return (
    <>
      <div className="flex-1 flex overflow-x-auto p-1 custom-scrollbar bg-obs-dock gap-1 h-full">
        {inputs.map(input => {
          const percent = mulToPercent(input.inputVolumeMul);
          return (
            <div key={input.inputName} className="w-[80px] h-full flex flex-col p-1 flex-shrink-0 border border-[#222222] bg-[#1a1a1a]">
              <div className="text-[10px] text-obs-text font-normal truncate text-center mb-1" title={input.inputName}>
                {input.inputName}
              </div>
              
              {/* OBS Audio Track: Slider + Meter container */}
              <div className="flex-1 flex justify-center relative py-2 min-h-[120px] w-full">
                
                {/* A container to perfectly center the meter and slider together */}
                <div className="relative h-full flex items-center justify-center w-[30px]">
                  {/* Audio Meter */}
                  <div className="absolute left-0 top-0 bottom-0 w-2">
                    <AudioMeter inputName={input.inputName} subscribeToMeter={subscribeToMeter} />
                  </div>
                  
                  {/* Slider */}
                  <div className="absolute left-[10px] top-0 bottom-0 h-full w-[20px] z-10 py-[2px]">
                    <Slider 
                      orientation="vertical"
                      min={0}
                      max={100}
                      value={[percent]}
                      onValueChange={(vals) => {
                        const val = Array.isArray(vals) ? vals[0] : vals;
                        onVolumeChange(input.inputName, percentToMul(val as number));
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between text-obs-text gap-1 mt-1">
                <span className="text-[10px] font-mono mx-auto text-obs-text mb-1">{input.inputVolumeDb.toFixed(1)} dB</span>
                
                <div className="flex justify-between w-full px-1">
                  <Button
                    variant="ghost" 
                    size="icon"
                    className={`w-5 h-5 p-0 rounded-sm hover:bg-obs-buttonHover ${!input.unmuted ? 'text-obs-red' : 'text-obs-textLight'}`}
                    onClick={() => onToggleMute(input.inputName, !input.unmuted)}
                  >
                    {input.unmuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </Button>
                  
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="w-5 h-5 p-0 rounded-sm hover:bg-obs-buttonHover text-obs-textLight"
                      onClick={() => setActiveSettingsInput(input.inputName)}
                      title="Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {activeSettingsInput && (
        <AudioFiltersModal 
          inputName={activeSettingsInput}
          filters={filtersMap[activeSettingsInput] || []}
          onToggleFilter={(filterName, enabled) => onToggleFilter(activeSettingsInput, filterName, enabled)}
          onUpdateSettings={(filterName, settings) => onUpdateSettings(activeSettingsInput, filterName, settings)}
          onClose={() => setActiveSettingsInput(null)}
        />
      )}
      
      {activePropertiesInput && (
        <InputSettingsModal 
          inputName={activePropertiesInput}
          settings={inputs.find(i => i.inputName === activePropertiesInput)?.inputSettings || {}}
          propertyItems={inputPropertiesMap[activePropertiesInput] || {}}
          onUpdateSettings={onUpdateInputSettings}
          onClose={() => setActivePropertiesInput(null)}
        />
      )}
    </>
  );
}
