import { useEffect, useRef } from 'react';

interface Props {
  inputName: string;
  subscribeToMeter: (inputName: string, cb: (mul: number) => void) => () => void;
}

export function AudioMeter({ inputName, subscribeToMeter }: Props) {
  const greenRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToMeter(inputName, (mul) => {
      const db = mul > 0 ? 20 * Math.log10(mul) : -100;
      
      let percent = 0;
      if (db > -60) {
        if (db <= -20) {
          // -60 to -20 dB maps to 0-70% (Green)
          percent = ((db + 60) / 40) * 70;
        } else if (db <= -9) {
          // -20 to -9 dB maps to 70-90% (Yellow)
          percent = 70 + ((db + 20) / 11) * 20;
        } else if (db <= 0) {
          // -9 to 0 dB maps to 90-100% (Red)
          percent = 90 + ((db + 9) / 9) * 10;
        } else {
          // Over 0 dB
          percent = 100;
        }
      }
      
      if (greenRef.current) greenRef.current.style.height = `${Math.min(percent, 70)}%`;
      if (yellowRef.current) yellowRef.current.style.height = `${Math.max(0, Math.min(percent - 70, 20))}%`;
      if (redRef.current) redRef.current.style.height = `${Math.max(0, percent - 90)}%`;
    });
  }, [inputName, subscribeToMeter]);

  return (
    <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col-reverse gap-[1px] pointer-events-none bg-[#000000] p-[1px] border border-black/50">
       <div ref={greenRef} className="w-full bg-[#33cc33]" style={{ height: '0%' }} />
       <div ref={yellowRef} className="w-full bg-yellow-400" style={{ height: '0%' }} />
       <div ref={redRef} className="w-full bg-[#cc3333]" style={{ height: '0%' }} />
    </div>
  );
}
