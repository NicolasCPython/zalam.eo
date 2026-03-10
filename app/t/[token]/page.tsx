'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';
import { MapPin } from 'lucide-react';

export default function VistaZalamera() {
  const params = useParams();
  const tokenUrl = params?.token as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!tokenUrl) return;

    const load = async () => {
      // Sumar visita
      await supabase.rpc('increment_views', { t_token: tokenUrl });
      
      const { data: res } = await supabase.from('sessions').select('*').eq('token', tokenUrl).single();
      
      if (res && res.active) {
        setData(res);
      } else {
        setError(true);
      }
    };
    
    load();

    const subscription = supabase
      .channel('public:sessions')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'sessions', 
        filter: `token=eq.${tokenUrl}` 
      }, (payload) => {
        if (payload.new.active) {
          setData(payload.new);
        } else {
          setError(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [tokenUrl]);

  const registrarClick = () => {
    supabase.rpc('increment_clicks', { t_token: tokenUrl });
    // URL LIMPIA DE GOOGLE MAPS
    const lat = data.lat;
    const lng = data.lng;
    const label = encodeURIComponent(data.message || "Zalameo");
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  if (error) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center p-6 italic font-serif">El zalamero se ha esfumado... 🍸</div>;
  if (!data) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse tracking-widest uppercase text-sm font-bold">Buscando el rastro...</div>;

  let spotifyEmbedUrl = null;
  if (data.spotify_url && data.spotify_url.includes('track/')) {
    const trackId = data.spotify_url.split('track/')[1].split('?')[0];
    spotifyEmbedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-serif italic text-[#b5893d] mb-8">Aquí anda el zalamero</h1>
      
      <div className="relative w-40 h-40 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(181,137,61,0.2)]">
        <div className="absolute w-full h-full bg-[#b5893d] rounded-full animate-ping opacity-20"></div>
        <MapPin size={48} className="text-[#b5893d] relative z-10" />
      </div>

      <div className="bg-[#1a1a1a] px-6 py-4 rounded-2xl border border-[#b5893d]/30 mb-8 max-w-xs">
        <p className="text-white italic">"{data.message}"</p>
      </div>

      {spotifyEmbedUrl && (
        <div className="w-full max-w-xs mb-8">
          <iframe 
            src={spotifyEmbedUrl} 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allow="encrypted-media"
            className="rounded-xl"
          ></iframe>
        </div>
      )}

      <button onClick={registrarClick} className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-lg active:scale-95 transition-transform w-full max-w-xs">
        LLEVARME CON ESTILO
      </button>

      <div className="mt-12 pt-6 border-t border-[#b5893d]/20 w-full max-w-xs">
        <p className="text-gray-500 text-xs italic mb-2 uppercase tracking-widest">🎵 Banda sonora oficial:</p>
        <a href="TU_LINK_INSTA" target="_blank" className="text-[#b5893d] font-bold text-lg">TU_GRUPO</a>
      </div>
    </main>
  );
}