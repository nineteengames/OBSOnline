import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface TransitionsDockProps {
  transitions: { transitionName: string }[];
  currentTransition: string;
  onSetTransition: (name: string) => void;
  isStudioModeEnabled: boolean;
  onTransition: () => void;
}

export const TransitionsDock: React.FC<TransitionsDockProps> = ({
  transitions,
  currentTransition,
  onSetTransition,
  isStudioModeEnabled,
  onTransition
}) => {
  return (
    <div className="flex flex-col h-full gap-1 p-1 bg-obs-dock">
      <Select value={currentTransition} onValueChange={(val) => val && onSetTransition(val)}>
        <SelectTrigger className="h-6 rounded-sm bg-[#111111] border-obs-border text-xs focus:ring-1 focus:ring-obs-accent">
          <SelectValue placeholder="Select Transition" />
        </SelectTrigger>
        <SelectContent className="bg-[#111111] border-obs-border text-obs-text rounded-sm">
          {transitions.map((t) => (
            <SelectItem key={t.transitionName} value={t.transitionName} className="text-xs hover:bg-obs-accent focus:bg-obs-accent focus:text-white rounded-none cursor-pointer">
              {t.transitionName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between text-[11px] px-1 mt-1">
        <span>Duration</span>
        <input type="text" className="w-12 h-5 bg-[#111111] border border-obs-border text-center focus:border-obs-accent outline-none" defaultValue="300ms" />
      </div>

      {isStudioModeEnabled && (
        <Button 
          variant="default" 
          className="mt-2 h-7 w-full bg-obs-button hover:bg-obs-buttonHover text-obs-textLight text-xs font-normal rounded-sm"
          onClick={onTransition}
        >
          Transition
        </Button>
      )}
    </div>
  );
};
