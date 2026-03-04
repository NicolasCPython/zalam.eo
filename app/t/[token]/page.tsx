'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '../../../supabase';
import { MapPin } from 'lucide-react';

export default function ViewLocation({ params }: { params: Promise<{ token: string }> }) {
  // Esto es lo que pide Next.js 15+ para leer el token
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .single();
      
      if (session) setData(session);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('realtime-location')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'sessions', 
        filter: `token=eq.${token}` 
      }, (payload) => {
        setData(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [token]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#b5893d]">Buscando al zalamero...</div>;
  
  if (!data || !data.active) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-6 text-center font-serif italic">"El arte se ha terminado por hoy. Mañana más." 🍸</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f7] p-6 text-center">
      <div className="space-y-8 w-full max-w-md">
        <h2 className="text-3xl font-serif italic text-[#b5893d]">Aquí anda el zalamero...</h2>
        
        <div className="relative w-full h-64 bg-zinc-900 rounded-3xl border border-[#b5893d]/20 flex items-center justify-center overflow-hidden">
          <div className="absolute w-32 h-32 bg-[#b5893d]/10 rounded-full animate-ping" />
          <MapPin size={48} className="text-[#b5893d] relative z-10" />
        </div>

        <div className="space-y-4">
          <p className="text-lg">"Estamos con una copa bonita. Vente." 😌🍸</p>
          
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`}
            target="_blank"
            className="inline-block w-full py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-lg"
          >
            VER EN GOOGLE MAPS
          </a>
        </div>
      </div>
    </main>
  );
}