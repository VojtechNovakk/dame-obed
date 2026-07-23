"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Oprava problému s ikonkami markerů v Next.js
const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Automatically invalidate size if container size changes (e.g. sidebar opening/closing)
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function Map({ 
  restaurants = [], 
  onRestaurantClick 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restaurants?: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRestaurantClick?: (restaurant: any) => void
}) {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Výchozí pozice (Praha) se použije, pokud mapa nemá žádné restaurace k vycentrování
  const defaultPosition: [number, number] = [50.0755, 14.4378];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        className="z-0 h-full w-full"
        zoomControl={false} // Schováme výchozí ovládání zoomu pro čistší vzhled, můžeme ho přidat jinam
      >
        <MapResizer />
        
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
              eventHandlers={{
                click: () => {
                  if (onRestaurantClick) {
                    onRestaurantClick(restaurant);
                  }
                }
              }}
            >
              {/* Záměrně bez Popup - nahrazeno bočním panelem */}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
