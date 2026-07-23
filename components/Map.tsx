"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Oprava problému s ikonkami markerů v Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

export default function Map({ restaurants = [] }: { restaurants?: any[] }) {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Výchozí pozice (Praha) se použije, pokud mapa nemá žádné restaurace k vycentrování
  const defaultPosition: [number, number] = [50.0755, 14.4378];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        {/* Nádherné Dark Theme mapové podklady od CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Vykreslení všech restaurací z databáze */}
        {restaurants.map((restaurant) => {
          // Pokud restaurace ještě nemá GPS souřadnice, přeskočíme ji
          if (!restaurant.latitude || !restaurant.longitude) return null;
          
          return (
            <Marker 
              key={restaurant.restaurant_id} 
              position={[restaurant.latitude, restaurant.longitude]}
            >
              <Popup className="rounded-xl overflow-hidden">
                <div className="p-2 text-center">
                  <h3 className="font-bold text-gray-900 text-lg">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{restaurant.address}</p>
                  <button className="mt-3 w-full bg-emerald-500 text-white py-1.5 px-3 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors">
                    Dnešní menu
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
