import { query } from './db';
import { Restaurant, MealSummary, TodayMealsMap } from './types';

export async function getAllRestaurants(): Promise<Restaurant[]> {
    const result = await query<Restaurant>('SELECT restaurant_id, name, address, url, latitude, longitude FROM restaurants');
    return result.rows;
}

export async function getFavouriteIds(userId: number): Promise<number[]> {
    const result = await query<{ restaurant_id: number }>('SELECT restaurant_id FROM favourites WHERE user_id = $1', [userId]);
    return result.rows.map(row => row.restaurant_id);
}

export async function getTodayMealsMap(): Promise<TodayMealsMap> {
    const menusResult = await query<{ restaurant_id: number, meals: MealSummary[] }>(`
        SELECT m.restaurant_id, json_agg(json_build_object('name', ml.name, 'price', ml.price)) as meals
        FROM menus m
        JOIN meals ml USING(menu_id)
        WHERE m.valid_for_date = CURRENT_DATE
        GROUP BY m.restaurant_id
    `);
    
    const todayMealsMap: TodayMealsMap = {};
    for (const row of menusResult.rows) {
        todayMealsMap[row.restaurant_id] = row.meals;
    }
    return todayMealsMap;
}
