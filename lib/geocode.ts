export interface AddressResult {
  label: string;
  lat: number;
  lon: number;
}

export async function searchAddresses(query: string): Promise<AddressResult[]> {
  const { OpenStreetMapProvider } = await import("leaflet-geosearch");
  const provider = new OpenStreetMapProvider({
    params: {
      "accept-language": "cs",
      limit: 5,
    },
  });
  const results = await provider.search({ query });
  return results
    .slice(0, 5)
    .map((result) => ({
      label: result.label,
      lat: result.y,
      lon: result.x,
    }))
    .filter((result) => Number.isFinite(result.lat) && Number.isFinite(result.lon));
}
