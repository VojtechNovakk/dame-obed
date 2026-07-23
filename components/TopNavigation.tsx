"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { User, Map, Heart, List } from "lucide-react";

export default function TopNavigation() {
  const [activeTab, setActiveTab] = useState("mapa");
  const { data: session } = useSession();

  const handleTabClick = (tab: string) => {
    if (tab === "oblibene" && !session) {
      signIn();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <nav className="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 z-50 relative pointer-events-auto">
      
      {/* Hlavička stránky - umístěná nalevo */}
      <header className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent drop-shadow-md">
          Dáme <span className="text-emerald-400">Oběd</span>
        </h1>
        <p className="text-white/70 font-medium text-xs drop-shadow-md hidden sm:block">
          Polední menu na jednom místě.
        </p>
      </header>

      {/* Hlavní navigace - vycentrovaná */}
      <div className="flex items-center bg-neutral-800/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl mx-auto md:mx-0 order-3 w-full md:w-auto md:order-2 justify-center">
        <button
          onClick={() => handleTabClick("mapa")}
          className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === "mapa"
              ? "bg-neutral-700/80 text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <Map size={18} />
          <span>Mapa</span>
        </button>
        <button
          onClick={() => handleTabClick("oblibene")}
          className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === "oblibene"
              ? "bg-neutral-700/80 text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <Heart size={18} />
          <span className="hidden sm:inline">Oblíbené</span>
        </button>
        <button
          onClick={() => handleTabClick("list")}
          className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === "list"
              ? "bg-neutral-700/80 text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
          }`}
        >
          <List size={18} />
          <span className="hidden sm:inline">Seznam</span>
        </button>
      </div>

      {/* Ikonka uživatele úplně vpravo */}
      <button 
        onClick={() => session ? (window.confirm('Přejete si odhlásit se?') && signOut()) : signIn()}
        title={session ? `Odhlásit se (${session.user?.name})` : "Přihlásit se"}
        className={`w-11 h-11 rounded-full bg-neutral-800/60 backdrop-blur-xl border flex items-center justify-center transition-all duration-300 shadow-xl order-2 md:order-3 ${
          session 
            ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10' 
            : 'border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-700/50'
        }`}
      >
        {session && session.user?.name ? (
          <span className="font-bold text-sm uppercase">{session.user.name.charAt(0)}</span>
        ) : (
          <User size={20} />
        )}
      </button>
    </nav>
  );
}
