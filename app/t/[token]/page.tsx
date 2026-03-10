'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';
import { MapPin } from 'lucide-react';

export default function VistaZalamera() {
  // AQUÍ ESTÁ LA MAGIA: Leemos la URL con la herramienta oficial
  const params = useParams();
  const tokenUrl = params?.token as string; 

  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      // 1. Si no lee la URL, salta el Fallo 1
      if (!tokenUrl) {
        setErrorMsg("Fallo 1: Sigo sin leer el código. Revisa que la carpeta se llame exactamente [token] con los corchetes puestos.");
        return;
      }

      // 2. Le preguntamos a Supabase
      const { data: res, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', tokenUrl)
        .single();

      if (fetchError) {
        setErrorMsg(`Fallo 2: ${fetchError.message}`);
        return;
      }

      // 3. Comprobamos que esté activa
      if (res && res.active) {
        setData(res);
      } else {
        setErrorMsg("Fallo 3: La sesión se cortó (active es false).");
      }
    };
    
    load();
  }, [tokenUrl]);

  // PANTALLA DEL CHIVATO (Si sigue fallando)
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#b5893d] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif italic mb-6">Algo falla, figura... 🛑</h2>
        <div className="text-sm font-mono text-red-400 bg-red-900/20 p-6 rounded-xl border border-red-500/30 break-all w-full max-w-sm">
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  // MIENTRAS CARGA
  if (!data) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse">Buscando el rastro...</div>;

  // EL RADAR (¡EL OBJETIVO FINAL!)
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif italic text-[#b5893d] mb-8">Aquí anda el zalamero</h1>
      
      <div className="relative w-40 h-40 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-8">
        <div className="absolute w-full h-full bg-[#b5893d] rounded-full animate-ping opacity-20"></div>
        <MapPin size={48} className="text-[#b5893d] relative z-10" />
      </div>

      <div className="bg-[#1a1a1a] px-6 py-4 rounded-2xl border border-[#b5893d]/30 mb-8 italic">
        "{data.message}"
      </div>

      <button 
        onClick={() => window.open(`https://maps.google.com/?q=${data.lat},${data.lng}`, '_blank')} 
        className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-lg active:scale-95 transition-transform"
      >
        LLEVARME CON ESTILO
      </button>
    </main>
  );
}