    import { query } from '@/lib/db'; // Cesta k souboru db.ts, který jsme předtím připravili

    export default async function Home() {
      try {
        // Pokusíme se načíst aktuální čas přímo z Postgres databáze
        const result = await query('SELECT NOW()');

        // Získáme vrácený čas
        const dbTime = result.rows[0].now;

        return (
          <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: 'green' }}>✅ Databáze je úspěšně
  připojena!</h1>
            <p>Aktuální čas z databáze:
  <strong>{String(dbTime)}</strong></p>
          </div>
        );

      } catch (error) {
        // Pokud připojení selže, zachytíme chybu
        console.error("Chyba databáze:", error);

        return (
          <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: 'red' }}>❌ K databázi se nepodařilo
  připojit.</h1>
            <p>Podívej se do terminálu (tam kde běží server), kde uvidíš
  přesný výpis chyby.</p>
          </div>
        );
      }
    }
