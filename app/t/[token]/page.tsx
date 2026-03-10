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
      // Sumar visita al cargar
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

  // FUNCIÓN CRÍTICA: Registrar click y abrir GPS
  const registrarClick = async () => {
    // 1. Enviamos el click a Supabase
    await supabase.rpc('increment_clicks', { t_token: tokenUrl });
    
    // 2. Esperamos 100ms para que la base de datos se entere
    setTimeout(() => {
      const lat = data.lat;
      const lng = data.lng;
      // Abrimos el mapa (location.href es mejor para móviles)
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }, 100);
  };

  if (error) return (
    <div className="min-h-screen bg-black text-[#b5893d] flex items-center justify-center p-6 italic font-serif text-xl text-center">