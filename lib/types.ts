export interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  url: string;
  latitude: number;
  longitude: number;
}

export interface MenuMeal {
  meal_id: number;
  menu_id: number;
  valid_for_date: string;
  name: string;
  price: number;
}

export interface MealSummary {
  name: string;
  price: number;
}

export type TodayMealsMap = Record<number, MealSummary[]>;

export interface Review {
  user_id: number;
  restaurant_id: number;
  stars: number;
  review: string;
  username?: string;
}

export type RatingsMap = Record<number, { avg_stars: number, count: number }>;
