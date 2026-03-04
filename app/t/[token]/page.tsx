'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';

export default function TrackingPage() {
  const params = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', params.token)
        .single();
      if (data) setSession(data);
      setLoading(false);
    }
    getData();
  }, [params.token]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Buscando...</div>;

  if (!session || !session.active) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <h2 className="text-[#b5893d] italic text-2xl">El arte se ha terminado por hoy. 🍸</h2>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 text-center">
      <h2 className="text-2xl italic text-[#b5893d] mb-8">Has encontrado al zalamero</h2>
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#b5893d]/20">
        <p className="text-gray-500 mb-4 tracking-widest uppercase text-xs">Ubicación en vivo</p>
        <a 
          href={`https://www.google.com/maps?q=${session.lat},${session.lng}`}
          target="_blank"
          className="inline-block px-8 py-4 bg-[#b5893d] text-black font-bold rounded-full"
        >
          VER EN MAPA 📍
        </a>
      </div>
    </main>
  );
}