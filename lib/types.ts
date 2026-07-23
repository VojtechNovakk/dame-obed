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
