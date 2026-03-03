'use client';
import { useState } from 'react';
import { supabase } from '../supabase';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Power } from 'lucide-react';

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);

  const startZalameo = async () => {
    // Generamos un código aleatorio de 6 letras/números
    const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // Caduca en 8 horas

    const { error } = await supabase.from('sessions').insert([
      { token: newToken, expires_at: expiresAt, active: true }
    ]);

    if (!error) {
      setToken(newToken);
      setActive(true);
      startTracking(newToken);
    } else {
      alert("Error al conectar con el arte. Revisa Supabase.");
    }
  };

  const startTracking = (token: string) => {
    navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from('sessions')
          .update({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          .eq('token', token);
      },
      (err) => console.error("Error de GPS:", err),
      { enableHighAccuracy: true }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f7] p-6 text-center">
      {!active ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif italic">¿Listo para que te encuentren?</h2>
          <button 
            onClick={startZalameo}
            className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full shadow-[0_0_40px_rgba(181,137,61,0.2)] hover:scale-105 transition-transform"
          >
            GENERAR QR CON PELIGRO 🍸
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-2xl font-serif italic text-[#b5893d]">Este QR tiene arte... Enséñalo.</h2>
          
          <div className="p-6 bg-white rounded-2xl shadow-[0_0_60px_rgba(181,137,61,0.4)]">
            {/* Aquí generamos el QR que apunta a la futura pantalla de las chicas */}
            <QRCodeSVG value={` "https://zalam-eo-bqth.vercel.app/"/t/${token}`} size={240} />
          </div>

          <div className="flex items-center space-x-3 text-green-500 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">Zalameando en vivo</span>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 text-red-500/50 hover:text-red-500 transition-colors pt-12"
          >
            <Power size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Cortar el arte</span>
          </button>
        </div>
      )}
    </main>
  );
}