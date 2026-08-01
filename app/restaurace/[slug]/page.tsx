import InteractiveMapLayout from '@/components/InteractiveMapLayout';
import { auth } from "@/auth";
import { getTodayRestaurants, searchRestaurants, searchTodayRestaurants } from '@/lib/actions';
import { getAllRestaurants, getFavouriteIds, getTodayMealsMap, getRestaurantRatingsMap } from '@/lib/data';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const restaurants = await getAllRestaurants();
  
  const idMatch = params.slug.match(/^(\d+)-/);
  const id = idMatch ? parseInt(idMatch[1], 10) : NaN;
  const restaurant = restaurants.find(r => r.restaurant_id === id);
  
  if (!restaurant) {
    return { title: 'Restaurace nenalezena | Dáme Oběd' };
  }

  const title = `${restaurant.name} | Dáme Oběd`;
  const description = `Podívejte se na dnešní menu v restauraci ${restaurant.name} na adrese ${restaurant.address}. Aktuální polední nabídka a ceny.`;
  const url = `https://www.dame-obed.cz/restaurace/${params.slug}`;

  return {
    title,
    description,
    keywords: [
      restaurant.name,
      "denní menu",
      "polední menu",
      "oběd",
      "restaurace",
      restaurant.address,
      "dáme oběd"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Dáme Oběd",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  }
}

export default async function RestaurantPage(
  props: { params: Promise<{ slug: string }>, searchParams?: Promise<{ search?: string, today?: string }> }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const isTodayOnly = searchParams?.today === 'true';

  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  let favouriteIds: number[] = [];
  if (userId) {
    favouriteIds = await getFavouriteIds(userId);
  }

  let restaurants;
  if (isTodayOnly) {
    if (search) {
      restaurants = await searchTodayRestaurants(search);
    } else {
      restaurants = await getTodayRestaurants();
    }
  } else if (search) {
    restaurants = await searchRestaurants(search);
  } else {
    restaurants = await getAllRestaurants();
  }

  const todayMealsMap = await getTodayMealsMap();
  const ratingsMap = await getRestaurantRatingsMap();

  // Získání ID z URL a validace (Soft-404 ochrana)
  const idMatch = params.slug.match(/^(\d+)-/);
  const id = idMatch ? parseInt(idMatch[1], 10) : NaN;
  
  // Kontrola, zda restaurace vůbec existuje v DB
  const allRestaurantsForCheck = await getAllRestaurants();
  const restaurant = allRestaurantsForCheck.find(r => r.restaurant_id === id);
  if (!restaurant) {
    notFound();
  }

  const todayMeals = todayMealsMap[id] || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address,
      "addressCountry": "CZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": restaurant.latitude,
      "longitude": restaurant.longitude
    },
    "url": `https://www.dame-obed.cz/restaurace/${params.slug}`,
    ...(restaurant.url ? { "sameAs": restaurant.url } : {}),
    ...(todayMeals.length > 0 ? {
      "hasMenu": {
        "@type": "Menu",
        "name": `Denní menu ${new Date().toLocaleDateString('cs-CZ')}`,
        "hasMenuItem": todayMeals.map((meal) => ({
          "@type": "MenuItem",
          "name": meal.name,
          "offers": {
            "@type": "Offer",
            "price": meal.price,
            "priceCurrency": "CZK"
          }
        }))
      }
    } : {})
  };

  return (
    <main className="h-[100dvh] w-screen bg-neutral-950 text-white selection:bg-emerald-500/30 flex flex-col overflow-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      <div className="flex-1 w-full relative z-0 min-h-0 overflow-hidden">
        <InteractiveMapLayout 
          restaurants={restaurants} 
          initialFavouriteIds={favouriteIds} 
          todayMealsMap={todayMealsMap} 
          ratingsMap={ratingsMap}
          initialRestaurantId={id}
        />
      </div>
    </main>
  );
}
