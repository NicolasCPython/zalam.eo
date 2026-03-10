'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Power, Send, Music, Eye, MousePointer2 } from 'lucide-react';

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);
  const [mensaje, setMensaje] = useState('Vente, que estamos bien... 😌🍸');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  // Escuchar estadísticas en tiempo real
  useEffect(() => {
    if (!token) return;
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'sessions', 
        filter: `token=eq.${token}` 
      }, (payload) => {
        setStats({ views: payload.new.v_views, clicks: payload.new.v_clicks });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [token]);

  const startZalameo = async () => {
    const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('sessions').insert([{ 
        token: newToken, 
        expires_at: expiresAt, 
        active: true,
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude,
        message: mensaje, 
        spotify_url: spotifyUrl || undefined // <--- ¡EL TRUCO ESTÁ AQUÍ!
      }]);
      if (!error) { setToken(newToken); setActive(true); }
    }, (err) => alert("Sin GPS no hay Zalameo, figura."), { enableHighAccuracy: true });
  };

  const actualizarUbicacion = () => {
    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('sessions').update({ 
        lat: pos.coords.latitude, lng: pos.coords.longitude, message: mensaje, spotify_url: spotifyUrl 
      }).eq('token', token);
      setIsUpdating(false);
      alert("📍 Posición y mensaje actualizados.");
    }, () => setIsUpdating(false), { enableHighAccuracy: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f7] p-6 text-center">
      {!active ? (
        <div className="space-y-4 w-full max-w-sm">
          <h2 className="text-2xl font-serif italic text-[#b5893d] mb-6">¿Dónde andas, criatura?</h2>
          <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Frase zalamera..." className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl text-white" />
          <input type="text" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Link de Spotify..." className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl text-white text-sm" />
          <button onClick={startZalameo} className="w-full py-4 bg-[#b5893d] text-black font-bold rounded-full">GENERAR PELIGRO 🍸</button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(181,137,61,0.3)]">
            <QRCodeSVG value={`https://zalam-eo-bqth.vercel.app/t/${token}`} size={200} />
          </div>
          
          {/* PANEL DE ANALÍTICAS PARA EL JEFE */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center text-[#b5893d] mb-1"><Eye size={16} className="mr-2"/> <span className="text-xs uppercase font-bold">Vistas</span></div>
              <span className="text-2xl font-black">{stats.views}</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center text-amber-500 mb-1"><MousePointer2 size={16} className="mr-2"/> <span className="text-xs uppercase font-bold">Clicks</span></div>
              <span className="text-2xl font-black">{stats.clicks}</span>
            </div>
          </div>

          <div className="w-full bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 space-y-3">
            <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="w-full px-4 py-2 bg-black border border-[#b5893d]/30 rounded-lg text-sm" />
            <button onClick={actualizarUbicacion} disabled={isUpdating} className="w-full py-3 bg-[#2a2a2a] text-[#b5893d] font-bold rounded-lg flex items-center justify-center space-x-2 border border-[#b5893d]/40">
              <Send size={18} /> <span>{isUpdating ? "Actualizando..." : "ACTUALIZAR ESTADO"}</span>
            </button>
          </div>

          <button onClick={() => window.location.reload()} className="flex items-center space-x-2 text-red-500/50 pt-4"><Power size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Cortar el arte</span></button>
        </div>
      )}
    </main>
  );
}