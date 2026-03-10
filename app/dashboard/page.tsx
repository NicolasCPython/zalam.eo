'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Power, Send, Music, Eye, MousePointer2 } from 'lucide-react';

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);
  const [mensaje, setMensaje] = useState('Vente, que estamos bien... 😌🍸');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. RECUPERAR SESIÓN AL CARGAR (Para que no se borre al refrescar)
  useEffect(() => {
    const savedToken = localStorage.getItem('zalameo_token');
    if (savedToken) {
      setToken(savedToken);
      setActive(true);
      // Cargamos los stats iniciales de esa sesión
      const loadStats = async () => {
        const { data } = await supabase.from('sessions').select('v_views, v_clicks, message, spotify_url').eq('token', savedToken).single();
        if (data) {
          setStats({ views: data.v_views || 0, clicks: data.v_clicks || 0 });
          setMensaje(data.message);
          setSpotifyUrl(data.spotify_url || '');
        }
      };
      loadStats();
    }
  }, []);

  // 2. ESCUCHAR CAMBIOS EN TIEMPO REAL
  useEffect(() => {
    if (!token) return;
    const channel = supabase.channel('stats-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `token=eq.${token}` }, (payload) => {
        setStats({ views: payload.new.v_views || 0, clicks: payload.new.v_clicks || 0 });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [token]);

  // FUNCIÓN: Generar el QR inicial
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
        spotify_url: spotifyUrl || undefined 
      }]);
      
      if (!error) { 
        setToken(newToken); 
        setActive(true); 
        localStorage.setItem('zalameo_token', newToken); // <--- GUARDAMOS EL SECRETO
      }
    }, (err) => alert("Activa el GPS, figura."), { enableHighAccuracy: true });
  };

  // FUNCIÓN: Actualizar posición/mensaje
  const actualizarUbicacion = () => {
    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('sessions').update({ 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude, 
        message: mensaje, 
        spotify_url: spotifyUrl || undefined 
      }).eq('token', token);
      setIsUpdating(false);
      alert("📍 Actualizado.");
    }, (err) => setIsUpdating(false), { enableHighAccuracy: true });
  };

  // FUNCIÓN: Cortar el arte (Y limpiar memoria)
  const cortarArte = async () => {
    await supabase.from('sessions').update({ active: false }).eq('token', token);
    localStorage.removeItem('zalameo_token'); // <--- BORRAMOS LA MEMORIA
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f7] p-6 text-center">
      {!active ? (
        <div className="space-y-4 w-full max-w-sm">
          <h2 className="text-2xl font-serif italic text-[#b5893d] mb-6">¿Dónde andas, criatura?</h2>
          <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Frase zalamera..." className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl text-white focus:outline-none" maxLength={40}/>
          <div className="flex items-center bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl px-4 py-3">
            <Music size={18} className="text-[#b5893d] mr-3" />
            <input type="text" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Link de Spotify..." className="w-full bg-transparent text-white focus:outline-none text-sm" />
          </div>
          <button onClick={startZalameo} className="w-full py-4 mt-4 bg-[#b5893d] text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform">GENERAR PELIGRO 🍸</button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <h2 className="text-xl font-serif italic text-[#b5893d]">Sesión Activa</h2>
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG value={`https://zalam-eo-bqth.vercel.app/t/${token}`} size={200} />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <Eye size={16} className="text-[#b5893d] mx-auto mb-1"/> 
              <span className="text-2xl font-black block">{stats.views}</span>
              <span className="text-[10px] uppercase opacity-50">Vistas</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <MousePointer2 size={16} className="text-green-500 mx-auto mb-1"/> 
              <span className="text-2xl font-black block">{stats.clicks}</span>
              <span className="text-[10px] uppercase opacity-50">Clicks</span>
            </div>
          </div>
          <div className="w-full bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 space-y-3">
            <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="w-full px-4 py-2 bg-black border border-[#b5893d]/30 rounded-lg text-sm text-white" />
            <button onClick={actualizarUbicacion} disabled={isUpdating} className="w-full py-3 bg-[#2a2a2a] text-[#b5893d] font-bold rounded-lg flex items-center justify-center space-x-2 border border-[#b5893d]/40">
              <Send size={18} /> 
              <span>{isUpdating ? "..." : "📍 ACTUALIZAR"}</span>
            </button>
          </div>
          <button onClick={cortarArte} className="text-red-500/50 hover:text-red-500 text-xs font-bold uppercase tracking-widest pt-2 flex items-center space-x-2">
            <Power size={14}/> <span>Cortar el arte</span>
          </button>
        </div>
      )}
    </main>
  );
}