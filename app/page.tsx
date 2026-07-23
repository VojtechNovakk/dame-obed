import MapWrapper from '@/components/MapWrapper';
import { query } from '@/lib/db';

export default async function Home() {
  const result = await query('SELECT * FROM restaurants');
  const restaurants = result.rows;

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30 flex flex-col items-center py-12 px-6 relative overflow-hidden">
      
      {/* Nádherný ambientní svítící efekt na pozadí */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hlavička stránky */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-10 z-10">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
            Dáme <span className="text-emerald-400">Oběd</span>
          </h1>
          <p className="text-white/50 mt-2 font-medium">Objev nejlepší polední menu ve svém okolí.</p>
        </div>
      </header>

      {/* Kontejner pro Mapu */}
      <section className="w-full max-w-6xl h-[65vh] min-h-[500px] relative z-10">
        <MapWrapper restaurants={restaurants} />
        
        {/* Plovoucí informační panel přes mapu (Glassmorphism design) */}
        <div className="absolute bottom-6 left-6 z-[400] bg-black/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl shadow-2xl">
          <h3 className="font-semibold text-white">Průzkumník okolí</h3>
          <p className="text-sm text-emerald-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Čekám na polohu uživatele...
          </p>
        </div>
      </section>

    </main>
  );
}
