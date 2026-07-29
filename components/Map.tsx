"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import type { Restaurant } from '@/lib/types';

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

function SelectedRestaurantPan({ selectedRestaurant }: { selectedRestaurant?: Restaurant | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.latitude && selectedRestaurant.longitude) {
      map.flyTo([selectedRestaurant.latitude, selectedRestaurant.longitude], 18, { animate: true, duration: 1.5 });
    }
  }, [selectedRestaurant, map]);
  return null;
}

function LocationMarker() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 18 });

    const handleLocationFound = (e: L.LocationEvent) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16, { animate: true, duration: 1.5 });
    };

    const handleLocationError = (e: L.ErrorEvent) => {
      console.log("Geolokace selhala nebo byla zamítnuta: ", e.message);
    };

    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map]);

  const userIcon = new L.Icon({
    iconUrl: '/user_pos.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon} />
  );
}

export default function Map({
  restaurants = [],
  selectedRestaurant,
  onRestaurantClick
}: {
  restaurants?: Restaurant[],
  selectedRestaurant?: Restaurant | null,
  onRestaurantClick?: (restaurant: Restaurant) => void
}) {

  const customPingIcon = new L.Icon({
    iconUrl: '/ping.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Předpokládáme středovou kotvu pro kruhový/ping ikon
  });

  const currentPingIcon = new L.Icon({
    iconUrl: '/current_ping.png',
    iconSize: [50, 50], // Mírně větší pro zvýraznění
    iconAnchor: [25, 25],
    className: "animate-pulse", // Přidáme pulzování pomocí Tailwindu
  });

  // Výchozí pozice (Praha) se použije, pokud mapa nemá žádné restaurace k vycentrování
  const defaultPosition: [number, number] = [50.0855, 14.4178];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultPosition}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0 h-full w-full"
        zoomControl={false} // Schováme výchozí ovládání zoomu pro čistší vzhled, můžeme ho přidat jinam
      >
        <MapResizer />
        <LocationMarker />
        <SelectedRestaurantPan selectedRestaurant={selectedRestaurant} />

        {/* Nádherné Dark Theme mapové podklady od CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Vykreslení všech restaurací z databáze */}
        {restaurants.map((restaurant) => {
          // Pokud restaurace ještě nemá GPS souřadnice, přeskočíme ji
          if (!restaurant.latitude || !restaurant.longitude) return null;

          // Vybereme správnou ikonku podle toho, jestli je tohle ta vybraná
          const isSelected = selectedRestaurant?.restaurant_id === restaurant.restaurant_id;

          return (
            <Marker
              key={restaurant.restaurant_id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={isSelected ? currentPingIcon : customPingIcon}
              zIndexOffset={isSelected ? 1000 : 0} // Dáme vybranou ikonku úplně navrch
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
