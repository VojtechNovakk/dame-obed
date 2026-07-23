import InteractiveMapLayout from '@/components/InteractiveMapLayout';

import { query } from '@/lib/db';

export default async function Home() {
  const result = await query('SELECT * FROM restaurants');
  const restaurants = result.rows;

  return (
    <main className="h-[100dvh] w-screen bg-neutral-950 text-white selection:bg-emerald-500/30 flex flex-col overflow-hidden relative">
      
      {/* Plovoucí prvky přes mapu */}
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
        {/* Nádherný ambientní svítící efekt na pozadí, teď centrovaný */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* Map Layout, který zabírá celý prostor */}
      <div className="flex-1 w-full relative z-0">
        <InteractiveMapLayout restaurants={restaurants} />
      </div>

    </main>
  );
}
