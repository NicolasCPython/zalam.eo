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

  // Escuchar estadísticas en tiempo real (Modo Jefe)
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
        setStats({ views: payload.new.v_views || 0, clicks: payload.new.v_clicks || 0 });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [token]);

  // FUNCIÓN 1: Generar el QR inicial
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
      } else {
        alert("Error al conectar con el arte. Revisa Supabase.");
      }
    }, (err) => alert("Sin GPS no hay Zalameo, figura. Actívalo."), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  // FUNCIÓN 2: Actualizar el estado a mitad de la noche
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
      alert("📍 Posición, música y mensaje actualizados con arte.");
    }, (err) => {
      setIsUpdating(false);
      alert("No se pudo obtener el GPS.");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  // FUNCIÓN 3: Apagar la luz e irnos a casa (AHORA CON CHIVATO)
  const cortarArte = async () => {
    // Intentamos apagar la sesión en la base de datos
    const { error } = await supabase.from('sessions').update({ active: false }).eq('token', token);
    
    if (error) {
      // Si el portero de Supabase nos bloquea, la pantalla nos grita el error
      alert(`Fallo al cortar: ${error.message}`);
    } else {
      // Si va bien, recarga la página para volver al inicio
      window.location.reload();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f7] p-6 text-center">
      {!active ? (
        <div className="space-y-4 w-full max-w-sm">
          <h2 className="text-2xl font-serif italic text-[#b5893d] mb-6">¿Dónde andas, criatura?</h2>
          
          <input 
            type="text" 
            value={mensaje} 
            onChange={(e) => setMensaje(e.target.value)} 
            placeholder="Frase zalamera..." 
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl text-white focus:outline-none focus:border-[#b5893d] transition-colors" 
            maxLength={40}
          />
          
          <div className="flex items-center bg-[#1a1a1a] border border-[#b5893d]/30 rounded-xl px-4 py-3 focus-within:border-[#b5893d] transition-colors">
            <Music size={18} className="text-[#b5893d] mr-3" />
            <input 
              type="text" 
              value={spotifyUrl} 
              onChange={(e) => setSpotifyUrl(e.target.value)} 
              placeholder="Link de Spotify (opcional)..." 
              className="w-full bg-transparent text-white focus:outline-none text-sm" 
            />
          </div>

          <button 
            onClick={startZalameo} 
            className="w-full py-4 mt-4 bg-[#b5893d] text-black font-bold rounded-full shadow-[0_0_40px_rgba(181,137,61,0.2)] hover:scale-105 transition-transform"
          >
            GENERAR PELIGRO 🍸
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <h2 className="text-xl font-serif italic text-[#b5893d]">Este QR tiene arte... Enséñalo.</h2>
          
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(181,137,61,0.3)]">
            <QRCodeSVG value={`https://zalam-eo-bqth.vercel.app/t/${token}`} size={200} />
          </div>
          
          {/* PANEL DE ANALÍTICAS PARA EL JEFE */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center text-[#b5893d] mb-1">
                <Eye size={16} className="mr-2"/> 
                <span className="text-xs uppercase font-bold">Vistas</span>
              </div>
              <span className="text-2xl font-black">{stats.views}</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-center text-green-500 mb-1">
                <MousePointer2 size={16} className="mr-2"/> 
                <span className="text-xs uppercase font-bold">Clicks</span>
              </div>
              <span className="text-2xl font-black">{stats.clicks}</span>
            </div>
          </div>

          {/* PANEL DE CONTROL MANUAL A MITAD DE NOCHE */}
          <div className="w-full bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 space-y-3">
            <input 
              type="text" 
              value={mensaje} 
              onChange={(e) => setMensaje(e.target.value)} 
              className="w-full px-4 py-2 bg-black border border-[#b5893d]/30 rounded-lg text-sm text-white focus:outline-none focus:border-[#b5893d]" 
              placeholder="Nuevo mensaje..."
            />
            <input 
              type="text" 
              value={spotifyUrl} 
              onChange={(e) => setSpotifyUrl(e.target.value)} 
              className="w-full px-4 py-2 bg-black border border-[#b5893d]/30 rounded-lg text-sm text-white focus:outline-none focus:border-[#b5893d]" 
              placeholder="Nuevo link de Spotify..."
            />
            <button 
              onClick={actualizarUbicacion} 
              disabled={isUpdating} 
              className="w-full py-3 bg-[#2a2a2a] text-[#b5893d] font-bold rounded-lg flex items-center justify-center space-x-2 border border-[#b5893d]/40 active:bg-[#b5893d] active:text-black transition-colors"
            >
              <Send size={18} /> 
              <span>{isUpdating ? "Actualizando..." : "📍 ACTUALIZAR ESTADO"}</span>
            </button>
          </div>

          {/* BOTÓN DE CORTAR EL ARTE */}
          <button 
            onClick={cortarArte} 
            className="flex items-center space-x-2 text-red-500/50 hover:text-red-500 transition-colors pt-2"
          >
            <Power size={16} /> 
            <span className="text-xs font-bold uppercase tracking-widest">Cortar el arte</span>
          </button>
        </div>
      )}
    </main>
  );
}