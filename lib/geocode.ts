export interface AddressResult {
  label: string;
  lat: number;
  lon: number;
}

// Photon (komoot) je bezplatný geokodér nad daty OpenStreetMap. Na rozdíl od
// Nominatimu je určený i pro našeptávání během psaní, takže ho smíme volat
// přímo z prohlížeče při každém (debounced) dotazu.
const PHOTON_URL = "https://photon.komoot.io/api/";

// Výsledky zvýhodníme v okolí Prahy, aby se nabízely relevantní adresy.
const BIAS_LAT = 50.0855;
const BIAS_LON = 14.4178;

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProperties;
}

function buildLabel(props: PhotonProperties): string {
  const street = [props.street, props.housenumber].filter(Boolean).join(" ");

  return [props.name || street, props.city || props.district || props.state, props.country]
    .filter((part): part is string => Boolean(part))
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(", ");
}

export async function searchAddresses(query: string): Promise<AddressResult[]> {
  // Photon vrací i více variant téhož místa, proto si vyžádáme rezervu
  // a duplicitní popisky níže odfiltrujeme.
  const params = new URLSearchParams({
    q: query,
    limit: "10",
    lat: String(BIAS_LAT),
    lon: String(BIAS_LON),
  });

  const response = await fetch(`${PHOTON_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Photon request failed: ${response.status}`);
  }

  const data: { features?: PhotonFeature[] } = await response.json();

  return (data.features ?? [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates;
      return {
        label: buildLabel(feature.properties ?? {}),
        lat: coordinates ? coordinates[1] : NaN,
        lon: coordinates ? coordinates[0] : NaN,
      };
    })
    .filter(
      (result) =>
        result.label !== "" && Number.isFinite(result.lat) && Number.isFinite(result.lon)
    )
    .filter(
      (result, index, all) => all.findIndex((other) => other.label === result.label) === index
    )
    .slice(0, 5);
}
