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
      const percent = Math.min(100, Math.max(0, ((db + 60) / 60) * 100));
      
      if (greenRef.current) greenRef.current.style.height = `${Math.min(percent, 70)}%`;
      if (yellowRef.current) yellowRef.current.style.height = `${Math.max(0, Math.min(percent - 70, 20))}%`;
      if (redRef.current) redRef.current.style.height = `${Math.max(0, percent - 90)}%`;
    });
  }, [inputName, subscribeToMeter]);

  return (
    <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col-reverse gap-[1px] pointer-events-none bg-[#000000] p-[1px] border border-black/50">
       <div ref={greenRef} className="w-full bg-[#33cc33] transition-all duration-75 ease-out" style={{ height: '0%' }} />
       <div ref={yellowRef} className="w-full bg-yellow-400 transition-all duration-75 ease-out" style={{ height: '0%' }} />
       <div ref={redRef} className="w-full bg-[#cc3333] transition-all duration-75 ease-out" style={{ height: '0%' }} />
    </div>
  );
}
