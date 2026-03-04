'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../supabase';
import { MapPin } from 'lucide-react';

export default function ViewLocation() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const { data: session } = await supabase.from('sessions').select('*').eq('token', token).single();
      if (session) setData(session);
      setLoading(false);
    };
    fetchData();

    const channel = supabase.channel('tracking').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'sessions', filter: "token=eq." + token }, 
      (payload) => { setData(payload.new); }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [token]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-600">Buscando...</div>;
  if (!data || !data.active) return <div className="min-h-screen bg-black flex items-center justify-center text-white p-6 text-center">"El arte se ha terminado por hoy." 🍸</div>;

  const mapUrl = "https://www.google.com/maps?q=" + data.lat + "," + data.lng;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 text-center">
      <div className="space-y-8 w-full max-w-md">
        <h2 className="text-3xl font-serif italic text-amber-600">Aquí anda el zalamero...</h2>
        <div className="relative w-full h-64 bg-zinc-900 rounded-3xl flex items-center justify-center">
          <MapPin size={48} className="text-amber-600 animate-bounce" />
        </div>
        <div className="space-y-4">
          <p className="text-lg">"Estamos con una copa bonita. Vente." 😌🍸</p>
          <a 
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full py-5 bg-amber-600 text-black font-bold rounded-full"
          >
            VER EN GOOGLE MAPS
          </a>
        </div>
      </div>
    </main>
  );
}