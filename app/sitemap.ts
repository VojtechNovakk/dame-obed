import type { MetadataRoute } from "next";
import { getAllRestaurants } from "@/lib/data";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pro účely sitemapy stáhneme jen nutná data (naštěstí v getAllRestaurants máme vše a je to rychlé)
  const restaurants = await getAllRestaurants();
  
  const restaurantEntries: MetadataRoute.Sitemap = restaurants.map((restaurant) => ({
    url: `https://www.dame-obed.cz/restaurace/${restaurant.restaurant_id}-${slugify(restaurant.name)}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: "https://www.dame-obed.cz",
      changeFrequency: "daily",
      priority: 1,
    },
    ...restaurantEntries,
  ];
}
