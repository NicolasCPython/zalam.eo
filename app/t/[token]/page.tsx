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

  const registrarClick = async () => {
    // 1. Avisar a Supabase
    await supabase.rpc('increment_clicks', { t_token: tokenUrl });
    
    // 2. Pequeño delay para asegurar que el click se registra
    setTimeout(() => {
      if (data) {
        const mapsUrl = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
        window.location.href = mapsUrl;
      }
    }, 150);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center p-6 italic font-serif text-xl text-center">
        El telón se ha cerrado. Mañana más. 🍸
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center animate-pulse tracking-widest uppercase text-sm font-bold">
        Buscando el rastro...
      </div>
    );
  }

  let spotifyEmbedUrl = null;
  if (data.spotify_url && data.spotify_url.includes('track/')) {
    const trackId = data.spotify_url.split('track/')[1].split('?')[0];
    spotifyEmbedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className