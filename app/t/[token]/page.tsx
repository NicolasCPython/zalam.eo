'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';

export default function RedirectPage() {
  const params = useParams();

  useEffect(() => {
    const getPos = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('lat, lng, active')
        .eq('token', params.token)
        .single();

      if (data && data.active && data.lat) {
        // Esto abre Google Maps directamente en su móvil
        window.location.href = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
      }
    };
    getPos();
  }, [params.token]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-[#b5893d] p-10 text-center">
      <div className="animate-pulse">
        <h2 className="text-2xl font-serif italic">Localizando al zalamero...</h2>
        <p className="text-sm mt-4 text-gray-500">Abriendo radar de Maps</p>
      </div>
    </div>
  );
}