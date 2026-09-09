import { useState, useEffect } from 'react';

export default function PelicanoAnimado() {
  const [posicionOjos, setPosicionOjos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const seguirCursor = (e) => {
      // Obtenemos el ancho y alto de la ventana
      const anchoVentana = window.innerWidth;
      const altoVentana = window.innerHeight;

      // Normalizamos la posición del mouse de -1 a 1
      const x = (e.clientX / anchoVentana - 0.5) * 2;
      const y = (e.clientY / altoVentana - 0.5) * 2;

      // Definimos cuánto se pueden mover las pupilas como máximo (en píxeles)
      const movimientoMaximo = 6; 

      setPosicionOjos({
        x: x * movimientoMaximo,
        y: y * movimientoMaximo,
      });
    };

    // Escuchamos el movimiento del mouse en toda la pantalla
    window.addEventListener('mousemove', seguirCursor);
    
    // Limpieza del evento cuando el componente se desmonta
    return () => window.removeEventListener('mousemove', seguirCursor);
  }, []);

  return (
    <div className="relative w-full h-[400px] flex items-end justify-center overflow-hidden">
      {/* Contenedor del Pelícano */}
      <div className="relative w-64 h-80 flex flex-col items-center justify-end z-10">
        
        {/* Cresta geométrica (pequeñas plumas) */}
        <div className="absolute top-2 flex gap-2">
          <div className="w-3 h-8 bg-slate-300 rounded-full transform -rotate-12 translate-y-2"></div>
          <div className="w-3 h-10 bg-slate-200 rounded-full"></div>
          <div className="w-3 h-8 bg-slate-300 rounded-full transform rotate-12 translate-y-2"></div>
        </div>

        {/* Cabeza y Cuerpo (Pilar principal) */}
        <div className="w-36 h-64 bg-slate-100 rounded-t-[70px] shadow-2xl relative flex flex-col items-center border-4 border-slate-200 z-20">
          
          {/* Contenedor de los Ojos */}
          <div className="flex gap-4 mt-10">
            {/* Ojo Izquierdo */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner border-2 border-slate-200">
              <div 
                className="w-4 h-4 bg-slate-800 rounded-full transition-transform duration-75 ease-out"
                style={{ transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)` }}
              ></div>
            </div>
            
            {/* Ojo Derecho */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner border-2 border-slate-200">
              <div 
                className="w-4 h-4 bg-slate-800 rounded-full transition-transform duration-75 ease-out"
                style={{ transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)` }}
              ></div>
            </div>
          </div>

          {/* Mejillas sonrojadas */}
          <div className="flex gap-16 mt-2 opacity-40">
            <div className="w-4 h-3 bg-red-400 rounded-full blur-[2px]"></div>
            <div className="w-4 h-3 bg-red-400 rounded-full blur-[2px]"></div>
          </div>
        </div>

        {/* Pico del Pelícano (Bolsa característica) */}
        <div className="absolute top-32 z-30 flex flex-col items-center">
          {/* Parte superior del pico */}
          <div className="w-24 h-4 bg-amber-400 rounded-full shadow-md z-40"></div>
          {/* Bolsa inferior del pico (grande y geométrica) */}
          <div className="w-20 h-28 bg-amber-300 rounded-b-[40px] shadow-lg transform -translate-y-1 border-x-4 border-b-4 border-amber-400 opacity-95"></div>
        </div>

        {/* Alas laterales */}
        <div className="absolute bottom-0 -left-6 w-16 h-32 bg-slate-300 rounded-t-full transform -rotate-12 z-10"></div>
        <div className="absolute bottom-0 -right-6 w-16 h-32 bg-slate-300 rounded-t-full transform rotate-12 z-10"></div>
      </div>
    </div>
  );
}