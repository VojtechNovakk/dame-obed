"use client";

import { LocateFixed, LocateOff, Loader2 } from "lucide-react";

export type LocationStatus = "idle" | "loading" | "denied";

export default function MyLocationButton({
  status = "idle",
  hasLocation = false,
  onClick
}: {
  status?: LocationStatus;
  hasLocation?: boolean;
  onClick: () => void;
}) {
  const isLoading = status === "loading";
  const isDenied = status === "denied";

  const label = isLoading ? "Hledám polohu..." : isDenied ? "Poloha zablokována" : "Moje poloha";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={label}
      title={isDenied ? "Přístup k poloze je zablokovaný. Klikni pro návod, jak ho povolit." : label}
      className={`flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-xl border shadow-2xl font-medium text-sm transition-colors disabled:cursor-wait ${
        isDenied
          ? "bg-neutral-900/90 border-red-500/30 text-red-400 hover:bg-neutral-900"
          : hasLocation
            ? "bg-neutral-900/90 border-emerald-500/30 text-emerald-400 hover:bg-neutral-900"
            : "bg-neutral-900/90 border-white/10 text-white hover:bg-neutral-900 hover:border-white/20"
      }`}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin flex-shrink-0" />
      ) : isDenied ? (
        <LocateOff size={18} className="flex-shrink-0" />
      ) : (
        <LocateFixed size={18} className="flex-shrink-0" />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
