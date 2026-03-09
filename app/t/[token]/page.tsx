'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { MapPin, Music } from 'lucide-react';

export default function VistaZalamera({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Sumar visita de forma anónima
      await supabase.rpc('increment_views', { t_token: params.token });
      
      const { data: res } = await supabase.from('sessions').select('*').eq('token', params.token).single();
      if (res && res.active) setData(res);
      else setError(true);
    };
    load();
  }, [params.token]);

  const registrarClick = async () => {
    await supabase.rpc('increment_clicks', { t_token: params.token });
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`;
    window.open(mapsUrl, '_blank');
  };

  if (error) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center p-10 italic">El zalamero se ha esfumado... 🍸</div>;
  if (!data) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse">Buscando el rastro...</div>;

  const spotifyId = data.spotify_url?.split('track/')[1]?.split('?')[0];

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

      {spotifyId && (
        <iframe src={`https://open.spotify.com/embed/track/${spotifyId}`} width="100%" height="80" frameBorder="0" allow="encrypted-media" className="max-w-xs mb-8 rounded-xl"></iframe>
      )}

      <button onClick={registrarClick} className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-lg active:scale-95 transition-transform">
        LLEVARME CON ESTILO
      </button>

      <div className="mt-12 pt-6 border-t border-white/5 w-full max-w-xs">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-2">Banda sonora oficial:</p>
        <a href="TU_LINK_INSTAGRAM_GRUPO" target="_blank" className="text-[#b5893d] font-bold hover:underline">NOMBRE_DEL_GRUPO 🎸</a>
      </div>
    </main>
  );
}