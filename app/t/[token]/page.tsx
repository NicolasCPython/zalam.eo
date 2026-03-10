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
      // 1. Sumar visita de forma anónima (Para el Modo Jefe)
      await supabase.rpc('increment_views', { t_token: tokenUrl });
      
      // 2. Buscar la ubicación
      const { data: res } = await supabase.from('sessions').select('*').eq('token', tokenUrl).single();
      
      if (res && res.active) {
        setData(res);
      } else {
        setError(true); // Si está apagado, salta la despedida
      }
    };
    
    load();

    // 3. Suscripción en tiempo real (si tú te mueves, ella lo ve)
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

  // Botón Mágico: Suma click al Jefe y abre el mapa real
  const registrarClick = async () => {
    await supabase.rpc('increment_clicks', { t_token: tokenUrl });
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`;
    window.open(mapsUrl, '_blank');
  };

  // PANTALLA DE CIERRE (Cuando le das a "Cortar el arte")
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 text-center italic font-serif text-xl text-[#b5893d]">
        El telón se ha cerrado. Mañana más. 🍸
      </div>
    );
  }

  // PANTALLA DE CARGA
  if (!data) return <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse tracking-widest uppercase text-sm font-bold">Buscando el arte...</div>;

  // TRUCO DE SPOTIFY: Transformar link normal a reproductor
  let spotifyEmbedUrl = null;
  if (data.spotify_url && data.spotify_url.includes('track/')) {
    const trackId = data.spotify_url.split('track/')[1].split('?')[0];
    spotifyEmbedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  }

  // EL RADAR ZALAMERO
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

      {/* REPRODUCTOR DE SPOTIFY */}
      {spotifyEmbedUrl && (
        <div className="w-full max-w-xs mb-8">
          <iframe 
            src={spotifyEmbedUrl} 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allow="encrypted-media"
            className="rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          ></iframe>
        </div>
      )}

      <button onClick={registrarClick} className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-[0_0_40px_rgba(181,137,61,0.3)] active:scale-95 hover:scale-105 transition-transform w-full max-w-xs">
        LLEVARME CON ESTILO
      </button>

      {/* EL BLINDAJE: PROMO DEL GRUPO */}
      <div className="mt-12 pt-6 border-t border-[#b5893d]/20 w-full max-w-xs">
        <p className="text-gray-500 text-xs italic mb-2 uppercase tracking-widest">🎵 Banda sonora oficial:</p>
        <a 
          href="https://www.instagram.com/lospunyalesdemartin/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#b5893d] font-bold text-lg hover:text-white transition-colors"
        >
          'LOS PUÑALES DE MARTÍN'
        </a>
      </div>
    </main>
  );
}