import { useState, useEffect } from 'react';

export default function ChalanaAnimada({ inputActivo }) {
  const [posicionOjos, setPosicionOjos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const seguirCursor = (e) => {
      // Si están escribiendo la contraseña, las gaviotas no miran el cursor
      if (inputActivo === 'password') return;

      const anchoVentana = window.innerWidth;
      const altoVentana = window.innerHeight;
      const x = (e.clientX / anchoVentana - 0.5) * 2;
      const y = (e.clientY / altoVentana - 0.5) * 2;
      const limite = 4; 

      setPosicionOjos({ x: x * limite, y: y * limite });
    };

    window.addEventListener('mousemove', seguirCursor);
    return () => window.removeEventListener('mousemove', seguirCursor);
  }, [inputActivo]);

  // Estados dinámicos basados en qué input está seleccionado
  const esPassword = inputActivo === 'password';
  const esEmail = inputActivo === 'email';

  const ojo = (small = false) => (
    <span className={`${small ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-white border border-slate-300 shadow-inner flex items-center justify-center overflow-hidden`}>
      <span
        className={`bg-slate-800 transition-all duration-300 ease-out ${esPassword ? (small ? 'w-1.5 h-0.5' : 'w-2 h-0.5') : (small ? 'w-1 h-1' : 'w-1.5 h-1.5')} rounded-full`}
        style={{ transform: esPassword ? 'translate(0, 0)' : `translate(${posicionOjos.x}px, ${posicionOjos.y}px)` }}
      />
    </span>
  );

  return (
    <div className="relative flex h-[310px] w-full items-end justify-center overflow-hidden">
      <style>{`
        @keyframes balanceo { 0%, 100% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(2deg) translateY(-6px); } }
        @keyframes oleaje { 0%, 100% { transform: translateX(-3%); } 50% { transform: translateX(3%); } }
        @keyframes aleteo { 0%, 100% { transform: rotate(10deg); } 50% { transform: rotate(-18deg); } }
        .animar-chalana { animation: balanceo 4s ease-in-out infinite; transform-origin: bottom center; }
        .animar-ola { animation: oleaje 5s ease-in-out infinite; }
        .animar-ala { animation: aleteo 0.8s ease-in-out infinite; transform-origin: right center; }
      `}</style>

      <div className="animar-ola absolute bottom-2 h-14 w-[125%] -translate-x-4 rounded-[50%] bg-sky-200/30 blur-md" />
      <div className="animar-ola absolute bottom-0 h-8 w-[115%] translate-x-8 rounded-[50%] border-t-2 border-sky-200/40" />

      <div className="animar-chalana relative z-10 flex flex-col items-center pb-6">
        <div
          className="absolute -top-14 left-2 z-40 flex h-16 w-20 items-center justify-center rounded-[55%_45%_48%_52%] border border-slate-300 bg-white shadow-lg transition-all duration-500"
          style={{ transform: esPassword ? 'translateX(-10px) rotate(-8deg) scaleX(-1)' : 'translateX(0) rotate(-3deg)' }}
        >
          <div className="absolute left-2 top-1 h-3 w-4 rounded-full bg-slate-200/80" />
          <div className="mt-1 flex gap-1">{ojo()} {ojo()}</div>
          <div className="absolute right-1 top-8 h-2 w-7 rotate-3 rounded-full bg-amber-400 shadow-sm" />
          <div className={`animar-ala absolute -right-4 top-3 h-4 w-10 rounded-[100%_20%_70%_30%] border border-slate-300 bg-slate-200 shadow-md ${esEmail ? 'animate-pulse' : ''}`} />
          <div className="absolute -bottom-2 left-6 h-3 w-2 rotate-12 rounded-full bg-orange-300" />
          <div className="absolute -bottom-2 left-10 h-3 w-2 -rotate-12 rounded-full bg-orange-300" />
        </div>

        <div
          className="absolute -top-10 right-8 z-40 flex h-11 w-14 items-center justify-center rounded-[55%_45%_48%_52%] border border-slate-300 bg-slate-100 shadow-md transition-all duration-700"
          style={{ transform: esEmail ? 'translate(-115px, -12px) rotate(-8deg) scale(1.05)' : esPassword ? 'rotate(8deg) scaleX(-1)' : 'rotate(4deg) scaleX(-1)' }}
        >
          <div className="absolute left-1 top-0 h-2 w-3 rounded-full bg-white" />
          <div className="mt-1 flex gap-0.5">{ojo(true)}</div>
          <div className="absolute right-0 top-6 h-1.5 w-5 rotate-3 rounded-full bg-amber-400" />
          <div className={`animar-ala absolute -right-3 top-2 h-3 w-7 rounded-[100%_20%_70%_30%] bg-white shadow ${esEmail ? 'opacity-100' : 'opacity-60'}`} />
        </div>

        <div className="relative z-30 h-24 w-60 overflow-hidden border-4 border-amber-950 bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 82% 100%, 18% 100%)' }}>
          <div className="absolute inset-x-0 top-3 h-1 bg-amber-300/60" />
          <div className="absolute inset-x-0 top-9 h-1 bg-amber-950/50" />
          <div className="absolute inset-x-0 top-[60px] h-1 bg-amber-300/30" />
          <div className="absolute left-8 top-0 h-full w-1 rotate-6 bg-amber-950/30" />
          <div className="absolute right-10 top-0 h-full w-1 -rotate-6 bg-amber-950/30" />
          <span className="absolute bottom-3 inset-x-0 text-center text-[11px] font-black uppercase tracking-[0.3em] text-amber-100 drop-shadow">Turi-Mar</span>
        </div>
        <div className="z-20 -mt-1 h-3 w-48 rounded-b-[50%] bg-black/30 blur-sm" />
      </div>
    </div>
  );
}