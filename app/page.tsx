import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-6xl font-black tracking-tighter text-[#f5f5f7] mb-2">ZALAMEO</h1>
      <p className="text-xl text-gray-400 text-center italic mb-10">
        "¿Dónde andas esta noche, criatura?"
      </p>
      
      <Link href="/dashboard" className="px-10 py-5 bg-[#b5893d] text-black font-bold rounded-full hover:bg-[#d4a85d] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(181,137,61,0.4)]">
        ENTRAR CON ARTE 🍸
      </Link>

      <p className="mt-12 text-xs text-gray-600 uppercase tracking-[0.2em]">Valencia • Sevilla • Clandestino</p>
    </main>
  );
}