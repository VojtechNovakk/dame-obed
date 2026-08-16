export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // odstraní diakritiku
    .replace(/\s+/g, "-") // nahradí mezery pomlčkami
    .replace(/[^\w\-]+/g, "") // odstraní všechny nealfanumerické znaky kromě pomlček
    .replace(/\-\-+/g, "-") // nahradí více pomlček jednou
    .replace(/^-+/, "") // ořízne pomlčky ze začátku
    .replace(/-+$/, ""); // ořízne pomlčky z konce
}

// Sestaví odkaz na přihlášení tak, aby se uživatel po přihlášení vrátil tam,
// odkud odešel (viz zpracování callbackUrl v components/auth/LoginForm.tsx).
export function getLoginUrl() {
  if (typeof window === "undefined") return "/login";
  const returnTo = window.location.pathname + window.location.search;
  return `/login?callbackUrl=${encodeURIComponent(returnTo)}`;
}

export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}
