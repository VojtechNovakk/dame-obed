"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import MapWrapper from "./MapWrapper";
import { X, Clock, MapPin, ExternalLink, Heart } from "lucide-react";
import { getMenu, addFavourite, removeFavourite } from "@/lib/actions";
import { slugify, getDistanceInKm } from "@/lib/utils";

import type { Restaurant, MenuMeal, TodayMealsMap } from '@/lib/types';
import TopNavigation from "./TopNavigation";
import RestaurantList from "./RestaurantList";

export default function InteractiveMapLayout({ restaurants, initialFavouriteIds = [], todayMealsMap = {}, initialRestaurantId }: { restaurants: Restaurant[], initialFavouriteIds?: number[], todayMealsMap?: TodayMealsMap, initialRestaurantId?: number }) {
  const { data: session } = useSession();
  const [favouriteIds, setFavouriteIds] = useState<number[]>(initialFavouriteIds);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const [maxDistance, setMaxDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolokace selhala: ", err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    if (!userLocation || maxDistance === 0) return restaurants;
    return restaurants.filter(r => {
      if (!r.latitude || !r.longitude) return false;
      const d = getDistanceInKm(userLocation.lat, userLocation.lng, r.latitude, r.longitude);
      return d <= maxDistance;
    });
  }, [restaurants, userLocation, maxDistance]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(() => {
    if (!initialRestaurantId) {
      return null;
    }

    return restaurants.find((r) => r.restaurant_id === initialRestaurantId) ?? null;
  });
  const [allMeals, setAllMeals] = useState<MenuMeal[]>(() => {
    if (initialRestaurantId && todayMealsMap?.[initialRestaurantId]) {
      const todayDateStr = new Date().toISOString().split('T')[0];
      return todayMealsMap[initialRestaurantId].map((meal, index) => ({
        meal_id: -(index + 1), // dočasné ID pro SSR
        menu_id: -1,
        valid_for_date: todayDateStr,
        name: meal.name,
        price: meal.price
      }));
    }
    return [];
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    if (initialRestaurantId && todayMealsMap?.[initialRestaurantId] && todayMealsMap[initialRestaurantId].length > 0) {
      return new Date().toDateString();
    }
    return null;
  });
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    if (!selectedRestaurant) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingMenu(() => {
      if (allMeals.length > 0 && allMeals[0].meal_id < 0 && selectedRestaurant.restaurant_id === initialRestaurantId) {
        return false;
      }
      return true;
    });
    getMenu(selectedRestaurant.restaurant_id)
      .then((data) => {
        setAllMeals(data);
        if (data.length > 0) {
          setSelectedDate(new Date(data[0].valid_for_date).toDateString());
        } else {
          setSelectedDate(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingMenu(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  // Synchronizace vybrané restaurace do URL pomocí History API (zamezuje re-renderu a probliknutí mapy)
  useEffect(() => {
    const selectedPath = selectedRestaurant ? `/restaurace/${selectedRestaurant.restaurant_id}-${slugify(selectedRestaurant.name)}` : "/";

    if (window.location.pathname !== selectedPath) {
      window.history.pushState(null, '', selectedPath);
    }
  }, [selectedRestaurant]);

  // Podpora pro tlačítka Zpět/Vpřed v prohlížeči
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/restaurace/')) {
        const idSlug = path.replace('/restaurace/', '');
        const idMatch = idSlug.match(/^(\d+)-/);
        if (idMatch) {
          const id = parseInt(idMatch[1], 10);
          const found = restaurants.find(r => r.restaurant_id === id);
          if (found) setSelectedRestaurant(found);
        } else {
          setSelectedRestaurant(null);
        }
      } else {
        setSelectedRestaurant(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restaurants]);

  // Vytažení unikátních datumů z dat
  const uniqueDates = Array.from(new Set(allMeals.map((meal) => new Date(meal.valid_for_date).toDateString())));

  const handleToggleFavourite = async () => {
    if (!session || !session.user?.id || !selectedRestaurant) {
      alert("Pro přidání do oblíbených se musíte přihlásit.");
      return;
    }
    
    const rId = selectedRestaurant.restaurant_id;
    const isFav = favouriteIds.includes(rId);

    // Optimistický update UI
    setFavouriteIds(prev => isFav ? prev.filter(id => id !== rId) : [...prev, rId]);

    try {
      let result;
      if (isFav) {
          result = await removeFavourite(rId);
      } else {
          result = await addFavourite(rId);
      }
      
      if (result?.error) {
        showToast(result.error, 'error');
        // Revert if error
        setFavouriteIds(prev => !isFav ? prev.filter(id => id !== rId) : [...prev, rId]);
      } else {
        showToast(isFav ? "Odebráno z oblíbených." : "Přidáno do oblíbených!", 'success');
      }
    } catch (e) {
      console.error(e);
      showToast("Došlo k nečekané chybě.", 'error');
      // Revert if network error or unhandled exception
      setFavouriteIds(prev => !isFav ? prev.filter(id => id !== rId) : [...prev, rId]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative min-h-0 overflow-hidden">
      {/* Container for Map */}
      <div className="flex-1 h-full relative min-h-0 overflow-hidden">
        {/* Hlavní navigace plovoucí nad mapou */}
        <div className="absolute top-0 left-0 w-full z-50 pointer-events-none p-4 md:p-6">
          <div className="pointer-events-auto w-full max-w-7xl mx-auto">
            <TopNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              restaurants={filteredRestaurants}
              onRestaurantSelect={(r) => setSelectedRestaurant(r)}
              maxDistance={userLocation ? maxDistance : undefined}
              onMaxDistanceChange={setMaxDistance}
            />
          </div>
        </div>

        {activeTab === "list" ? (
          <RestaurantList 
            restaurants={filteredRestaurants} 
            onRestaurantClick={(r) => setSelectedRestaurant(r)} 
            emptyMessage={filteredRestaurants.length === 0 ? "Žádné restaurace neodpovídají vašemu vyhledávání nebo zvolené vzdálenosti." : undefined}
            todayMealsMap={todayMealsMap}
          />
        ) : activeTab === "favourites" ? (
          <RestaurantList 
            restaurants={filteredRestaurants.filter(r => favouriteIds.includes(r.restaurant_id))} 
            onRestaurantClick={(r) => setSelectedRestaurant(r)} 
            emptyMessage={favouriteIds.length === 0 ? "Zatím nemáte žádné oblíbené restaurace. Přidejte si je kliknutím na srdíčko v detailu restaurace." : "Vašemu vyhledávání neodpovídají žádné z vašich oblíbených restaurací."}
            todayMealsMap={todayMealsMap}
          />
        ) : (
          <MapWrapper 
            restaurants={filteredRestaurants} 
            selectedRestaurant={selectedRestaurant}
            onRestaurantClick={(r) => setSelectedRestaurant(r)}
            userLocation={userLocation}
            maxDistance={maxDistance}
          />
        )}
      </div>

      {/* Detail Panel */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 bg-neutral-900/95 backdrop-blur-xl border-white/10 shadow-2xl flex flex-col z-[400] relative
        ${selectedRestaurant 
          ? 'w-full md:w-[450px] h-[45vh] md:h-full border-t md:border-t-0 md:border-l opacity-100' 
          : 'w-full md:w-0 h-0 md:h-full opacity-0 border-transparent'}`}
      >
        <div className="w-full md:w-[450px] h-[45vh] md:h-full flex flex-col absolute top-0 left-0">
          <button 
            onClick={() => setSelectedRestaurant(null)}
            className="absolute top-4 left-4 md:top-6 md:left-6 w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10 shadow-xl"
          >
            <X size={20} />
          </button>
          
          <button 
            onClick={handleToggleFavourite}
            className={`absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10 shadow-xl ${
              selectedRestaurant && favouriteIds.includes(selectedRestaurant.restaurant_id) ? "text-red-500 hover:text-red-400" : "text-white"
            }`}
          >
            <Heart 
              size={20} 
              fill={selectedRestaurant && favouriteIds.includes(selectedRestaurant.restaurant_id) ? "currentColor" : "none"} 
            />
          </button>

          <div className="p-6 pt-20 md:pt-24 overflow-y-auto flex-1 custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedRestaurant?.name}</h2>
            
            <div className="flex items-start gap-2 text-neutral-400 text-sm mb-6">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <p>{selectedRestaurant?.address}</p>
            </div>

            {/* Dnešní menu */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex flex-col min-h-[250px]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4 flex-shrink-0">
                <Clock size={18} />
                <h3>Menu restaurace</h3>
              </div>
              
              {isLoadingMenu ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-neutral-400 animate-pulse">Načítám menu...</p>
                </div>
              ) : uniqueDates.length > 0 ? (
                <>
                  {/* Navigace mezi dny */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar flex-shrink-0">
                      {uniqueDates.map((dateStr) => {
                         const dateObj = new Date(dateStr);
                         const isToday = new Date().toDateString() === dateObj.toDateString();
                         const dateLabel = isToday ? 'Dnes' : dateObj.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' });
                         
                         return (
                           <button 
                             key={dateStr}
                             onClick={() => setSelectedDate(dateStr)}
                             className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                               selectedDate === dateStr 
                                 ? 'bg-emerald-500 text-white' 
                                 : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                             }`}
                           >
                             {dateLabel}
                           </button>
                         )
                      })}
                    </div>

                  {/* Výpis konkrétních jídel */}
                  <div className="space-y-4">
                    {allMeals
                      .filter(meal => new Date(meal.valid_for_date).toDateString() === selectedDate)
                      .map((meal) => (
                        <div key={meal.meal_id} className="flex justify-between items-start gap-4 border-b border-white/5 pb-3 last:border-0">
                          <div>
                            <p className="text-sm text-neutral-200">{meal.name}</p>
                          </div>
                          <span className="text-sm font-medium text-emerald-400 whitespace-nowrap">{meal.price} Kč</span>
                        </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-neutral-400 text-center">Tato restaurace momentálně nemá dostupná žádná meníčka.</p>
                </div>
              )}
            </div>

            {selectedRestaurant?.url ? (
              <a 
                href={selectedRestaurant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Přejít na web restaurace
                <ExternalLink size={16} />
              </a>
            ) : (
              <button disabled className="w-full flex items-center justify-center gap-2 bg-neutral-800 text-neutral-500 cursor-not-allowed py-3 rounded-xl font-semibold transition-colors">
                Web nedostupný
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifikace */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] animate-toast-in pointer-events-none">
          <div className={`px-6 py-3 rounded-full backdrop-blur-xl shadow-2xl border font-medium text-sm flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            toast.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            'bg-neutral-800/80 text-white border-white/10'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
