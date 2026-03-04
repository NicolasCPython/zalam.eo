'use client';
import { useState } from 'react';
import { supabase } from '../supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Power } from 'lucide-react';

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);

  const startZalameo = async () => {
    const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('sessions').insert([
      { token: newToken, expires_at: expiresAt, active: true }
    ]);

    if (!error) {
      setToken(newToken);
      setActive(true);
      startTracking(newToken);
    } else {
      alert("Error al conectar con el arte.");
    }
  };

  const startTracking = (tokenActual: string) => {
    navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from('sessions')
          .update({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          .eq('token', tokenActual);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 text-center">
      {!active ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif italic">¿Listo para que te encuentren?</h2>
          <button
            onClick={startZalameo}
            className="px-10 py-5 bg-amber-600 text-black font-bold rounded-full"
          >
            GENERAR QR CON PELIGRO 🍸
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-2xl font-serif italic text-amber-600">Este QR tiene arte... Enséñalo.</h2>
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG value={"https://zalam-eo-bqth.vercel.app/t/" + token} size={200} />
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 text-red-500 pt-10"
          >
            <Power size={16} />
            <span>CORTAR EL ARTE</span>
          </button>
        </div>
      )}
    </main>
  );
}