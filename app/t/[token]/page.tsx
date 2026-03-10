'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { MapPin } from 'lucide-react';

export default function VistaZalamera({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      // 1. Comprobamos si la carpeta está bien nombrada
      if (!params.token) {
        setErrorMsg("Fallo 1: params.token es UNDEFINED. ¿Llamaste a la carpeta [token] con los corchetes puestos?");
        return;
      }

      // 2. Le preguntamos a Supabase qué pasa realmente
      const { data: res, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', params.token)
        .single();

      if (fetchError) {
        setErrorMsg(`Fallo 2 (Supabase dice): ${fetchError.message} (Código: ${fetchError.code})`);
        return;
      }

      // 3. Comprobamos si la sesión está apagada o no
      if (res && res.active) {
        setData(res);
      } else {
        setErrorMsg("Fallo 3: La fila existe, pero la columna 'active' está en false.");
      }
    };
    
    load();
  }, [params.token]);

  // PANTALLA DE ERROR CHIVATA
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#b5893d] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif italic mb-6">Algo falla, figura... 🛑</h2>
        <div className="text-sm font-mono text-red-400 bg-red-900/20 p-6 rounded-xl border border-red-500/30 break-all w-full max-w-sm">
          <p className="font-bold text-white mb-2">MOTIVO EXACTO DEL ERROR:</p>
          <p>{errorMsg}</p>
          <p className="mt-4 text-gray-500">Token buscado: {params.token || "Ninguno"}</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse">Buscando el rastro...</div>;

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

      <button onClick={() => window.open(`http://maps.google.com/maps?q=${data.lat},${data.lng}`, '_blank')} className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-lg active:scale-95 transition-transform">
        LLEVARME CON ESTILO
      </button>
    </main>
  );
}