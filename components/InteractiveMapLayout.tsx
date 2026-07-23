"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MapWrapper from "./MapWrapper";
import { X, Clock, MapPin, ExternalLink, Heart } from "lucide-react";
import { getMenu, addFavourite, removeFavourite } from "@/lib/actions";

import TopNavigation from "./TopNavigation";
import RestaurantList from "./RestaurantList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InteractiveMapLayout({ restaurants, initialFavouriteIds = [] }: { restaurants: any[], initialFavouriteIds?: number[] }) {
  const { data: session } = useSession();
  const [favouriteIds, setFavouriteIds] = useState<number[]>(initialFavouriteIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allMeals, setAllMeals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("mapa");

  useEffect(() => {
    if (!selectedRestaurant) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingMenu(true);
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
  }, [selectedRestaurant]);

  // Vytažení unikátních datumů z dat
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueDates = Array.from(new Set(allMeals.map((meal: any) => new Date(meal.valid_for_date).toDateString())));

  const handleToggleFavourite = async () => {
    if (!session || !session.user?.id || !selectedRestaurant) {
      alert("Pro přidání do oblíbených se musíte přihlásit.");
      return;
    }
    
    const rId = selectedRestaurant.restaurant_id;
    const uId = parseInt(session.user.id);
    const isFav = favouriteIds.includes(rId);

    // Optimistický update UI
    setFavouriteIds(prev => isFav ? prev.filter(id => id !== rId) : [...prev, rId]);

    try {
      if (isFav) {
        await removeFavourite(uId, rId);
      } else {
        await addFavourite(uId, rId);
      }
    } catch (e) {
      console.error(e);
      // Revert if error
      setFavouriteIds(prev => !isFav ? prev.filter(id => id !== rId) : [...prev, rId]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative">
      {/* Container for Map */}
      <div className="flex-1 h-full relative">
        {/* Hlavní navigace plovoucí nad mapou */}
        <div className="absolute top-0 left-0 w-full z-50 pointer-events-none p-4 md:p-6">
          <div className="pointer-events-auto w-full max-w-7xl mx-auto">
            <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {activeTab === "list" ? (
          <RestaurantList 
            restaurants={restaurants} 
            onRestaurantClick={(r) => setSelectedRestaurant(r)} 
          />
        ) : activeTab === "oblibene" ? (
          <RestaurantList 
            restaurants={restaurants.filter(r => favouriteIds.includes(r.restaurant_id))} 
            onRestaurantClick={(r) => setSelectedRestaurant(r)} 
          />
        ) : (
          <MapWrapper 
            restaurants={restaurants} 
            selectedRestaurant={selectedRestaurant}
            onRestaurantClick={(r) => setSelectedRestaurant(r)}
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {uniqueDates.map((dateStr: any) => {
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .map((meal: any, index: number) => (
                        <div key={index} className="flex justify-between items-start gap-4 border-b border-white/5 pb-3 last:border-0">
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

            <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
              Přejít na web restaurace
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
