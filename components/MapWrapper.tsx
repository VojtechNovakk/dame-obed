"use client";

import dynamic from 'next/dynamic';
import type { Restaurant } from '@/lib/types';

// V Next.js 15+ se ssr: false pro next/dynamic smí použít pouze uvnitř Client Componenty
const DynamicMap = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm animate-pulse">
      <p className="text-emerald-500/80 font-medium tracking-wide">Načítám interaktivní mapu...</p>
    </div>
  )
});

export default function MapWrapper({ 
  restaurants = [], 
  selectedRestaurant,
  onRestaurantClick,
  userLocation,
  maxDistance
}: { 
  restaurants?: Restaurant[],
  selectedRestaurant?: Restaurant | null,
  onRestaurantClick?: (restaurant: Restaurant) => void,
  userLocation?: { lat: number, lng: number } | null,
  maxDistance?: number
}) {
  return (
    <DynamicMap 
      restaurants={restaurants} 
      selectedRestaurant={selectedRestaurant}
      onRestaurantClick={onRestaurantClick} 
      userLocation={userLocation}
      maxDistance={maxDistance}
    />
  );
}
