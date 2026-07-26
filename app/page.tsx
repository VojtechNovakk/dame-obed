import InteractiveMapLayout from '@/components/InteractiveMapLayout';

import { auth } from "@/auth";
import { getTodayRestaurants, searchRestaurants, searchTodayRestaurants } from '@/lib/actions';
import { getAllRestaurants, getFavouriteIds, getTodayMealsMap } from '@/lib/data';

export default async function Home(props: { searchParams?: Promise<{ search?: string, today?: string }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const isTodayOnly = searchParams?.today === 'true';

  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  let favouriteIds: number[] = [];
  if (userId) {
    favouriteIds = await getFavouriteIds(userId);
  }

  let restaurants;
  if (isTodayOnly) {
    if (search) {
      restaurants = await searchTodayRestaurants(search);
    } else {
      restaurants = await getTodayRestaurants();
    }
  } else if (search) {
    restaurants = await searchRestaurants(search);
  } else {
    restaurants = await getAllRestaurants();
  }

  const todayMealsMap = await getTodayMealsMap();

  return (
    <main className="h-[100dvh] w-screen bg-neutral-950 text-white selection:bg-emerald-500/30 flex flex-col overflow-hidden relative">
      
      {/* Plovoucí prvky přes mapu */}
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
        {/* Nádherný ambientní svítící efekt na pozadí, teď centrovaný */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* Map Layout, který zabírá celý prostor */}
      <div className="flex-1 w-full relative z-0 min-h-0 overflow-hidden">
        <InteractiveMapLayout restaurants={restaurants} initialFavouriteIds={favouriteIds} todayMealsMap={todayMealsMap} />
      </div>

    </main>
  );
}
