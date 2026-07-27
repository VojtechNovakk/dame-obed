"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, Map, Heart, List, Search, LogOut, Loader2, X } from "lucide-react";
import type { Restaurant } from '@/lib/types';

export default function TopNavigation({
  activeTab,
  onTabChange,
  restaurants = [],
  onRestaurantSelect
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  restaurants?: Restaurant[];
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}) {
  const { data: session } = useSession();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const currentToday = searchParams.get("today") === "true";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isTodayOnly, setIsTodayOnly] = useState(currentToday);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (isSearchDropdownOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isSearchDropdownOpen]);

  // Synchronizace lokálního stavu s URL (např. při použití tlačítka Zpět v prohlížeči)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(currentSearch);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTodayOnly(currentToday);
  }, [currentSearch, currentToday]);

  // Zápis do URL při změně lokálního stavu uživatelem
  useEffect(() => {
    // Provedeme zápis pouze pokud se lokální stav opravdu liší od URL
    if (searchTerm === currentSearch && isTodayOnly === currentToday) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }

      if (isTodayOnly) {
        params.set("today", "true");
      } else {
        params.delete("today");
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isTodayOnly, currentSearch, currentToday, pathname, router, searchParams]);

  const handleTabClick = (tab: string) => {
    if (tab === "favourites" && !session) {
      router.push('/login');
      return;
    }
    
    // Reset filters
    setSearchTerm("");
    setIsTodayOnly(false);
    
    // Clear URL parameters immediately
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("today");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });

    onTabChange(tab);
  };

  const filteredRestaurants = mapSearchQuery.trim() === "" ? [] : (restaurants || []).filter(r => 
    r.name.toLowerCase().includes(mapSearchQuery.toLowerCase()) || 
    (r.address && r.address.toLowerCase().includes(mapSearchQuery.toLowerCase()))
  ).slice(0, 8);

  return (
    <nav className="w-full flex flex-wrap md:flex-nowrap justify-between items-start gap-4 z-50 relative pointer-events-auto">
      
      {/* Hlavička stránky - umístěná nalevo */}
      <header className="flex flex-col md:flex-1 pt-1 order-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent drop-shadow-md">
          Dáme <span className="text-emerald-400">Oběd</span>
        </h1>
        <p className="text-white/70 font-medium text-xs drop-shadow-md hidden sm:block">
          Polední menu na jednom místě.
        </p>
      </header>

      {/* Střed: Taby + Vyhledávání se stejnou šířkou */}
      <div className="flex flex-col items-stretch gap-2 shrink-0 w-full md:w-auto order-3 md:order-2">
        {/* Tab navigace */}
        <div className="flex items-center justify-between sm:justify-start bg-neutral-800/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          <button
            onClick={() => handleTabClick("map")}
            className={`flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "map"
                ? "bg-neutral-700/80 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            }`}
          >
            <Map size={18} />
            <span className="hidden sm:inline">Mapa</span>
          </button>
          <button
            onClick={() => handleTabClick("favourites")}
            className={`flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "favourites"
                ? "bg-neutral-700/80 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            }`}
          >
            <Heart size={18} />
            <span className="hidden sm:inline">Oblíbené</span>
          </button>
          <button
            onClick={() => handleTabClick("list")}
            className={`flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "list"
                ? "bg-neutral-700/80 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            }`}
          >
            <List size={18} />
            <span className="hidden sm:inline">Seznam</span>
          </button>
        </div>

        {/* Vyhledávání a přepínač - stejná šířka jako taby */}
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          {activeTab === 'map' ? (
            <div className="relative flex-1 min-w-0" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Hledat restauraci na mapě..."
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => {
                  if (mapSearchQuery.trim() !== "") setIsSearchDropdownOpen(true);
                }}
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 bg-neutral-900/80 backdrop-blur-xl border border-emerald-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 transition-all shadow-xl"
              />
              {mapSearchQuery && (
                <button 
                  onClick={() => {
                    setMapSearchQuery("");
                    setIsSearchDropdownOpen(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
              {/* Dropdown */}
              {isSearchDropdownOpen && filteredRestaurants.length > 0 && (
                <div className="absolute top-[110%] left-0 w-full bg-neutral-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredRestaurants.map(r => (
                    <button
                      key={r.restaurant_id}
                      onClick={() => {
                        setMapSearchQuery(r.name);
                        setIsSearchDropdownOpen(false);
                        if (onRestaurantSelect) onRestaurantSelect(r);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{r.address || "Adresa neznámá"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Hledat podnik nebo jídlo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 bg-neutral-800/60 backdrop-blur-xl border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-xl"
              />
              {isPending && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Loader2 size={16} className="text-emerald-500 animate-spin" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer" onClick={() => setIsTodayOnly(!isTodayOnly)}>
            <span className={`text-[10px] sm:text-xs font-semibold transition-colors ${isTodayOnly ? 'text-emerald-400' : 'text-neutral-400'}`}>
              Dnes
            </span>
            <button
              title={isTodayOnly ? "Hledat pouze v dnešním menu (Zapnuto)" : "Hledat pouze v dnešním menu (Vypnuto)"}
              className={`relative flex items-center shrink-0 w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-all duration-300 border border-white/10 focus:outline-none pointer-events-none ${
                isTodayOnly 
                  ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
                  : 'bg-neutral-800'
              }`}
            >
              <div 
                className={`absolute w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white transition-all duration-300 transform ${
                  isTodayOnly ? 'translate-x-[20px] sm:translate-x-[22px]' : 'translate-x-0.5 sm:translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Ikonka uživatele úplně vpravo */}
      <div ref={profileMenuRef} className="flex items-center gap-3 md:flex-1 justify-end relative pt-1 order-2 md:order-3">

        <button 
          onClick={() => session ? setIsProfileMenuOpen(!isProfileMenuOpen) : router.push('/login')}
          title={session ? `Profil (${session.user?.name})` : "Přihlásit se"}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-800/60 backdrop-blur-xl border flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${
            session 
              ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-700/50'
          }`}
        >
          {session && session.user?.name ? (
            <span className="font-bold text-sm uppercase">{session.user.name.charAt(0)}</span>
          ) : (
            <User size={18} className="sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Rozbalovací menu pro profil */}
        {session && isProfileMenuOpen && (
          <div className="absolute top-[110%] right-0 mt-1 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-white truncate">{session.user?.name || "Uživatel"}</p>
              <p className="text-xs text-neutral-400 truncate">{session.user?.email || ""}</p>
            </div>
            <button 
              onClick={() => {
                setIsProfileMenuOpen(false);
                signOut();
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-3"
            >
              <LogOut size={16} />
              Odhlásit se
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
