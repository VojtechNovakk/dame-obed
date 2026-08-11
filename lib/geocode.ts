import { OpenStreetMapProvider } from "leaflet-geosearch";

export interface AddressResult {
  label: string;
  lat: number;
  lon: number;
}

const provider = new OpenStreetMapProvider({
  params: {
    "accept-language": "cs",
    limit: 5,
  },
});

export async function searchAddresses(query: string): Promise<AddressResult[]> {
  const results = await provider.search({ query });
  return results.slice(0, 5).map((result) => ({
    label: result.label,
    lat: result.y,
    lon: result.x,
  }));
}
