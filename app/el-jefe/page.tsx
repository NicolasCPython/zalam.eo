'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function PaginaJefe() {
  const [sesiones, setSesiones] = useState<any[]>([]);

  useEffect(() => {
    async function cargarDatos() {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setSesiones(data);
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-serif text-amber-600 mb-6">Panel del Jefe</h1>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-amber-600 uppercase text-xs">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Token</th>
              <th className="p-4 text-center">Vistas</th>
              <th className="p-4 text-center">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((s) => (
              <tr key={s.id} className="border-t border-white/5">
                <td className="p-4 text-sm text-zinc-400">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-mono text-amber-500">{s.token}</td>
                <td className="p-4 text-center font-bold">{s.v_views || 0}</td>
                <td className="p-4 text-center text-green-500 font-bold">{s.v_clicks || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}