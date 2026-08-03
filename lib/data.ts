import { query } from './db';
import { Restaurant, MealSummary, TodayMealsMap, RatingsMap, Review } from './types';

export async function getAllRestaurants(): Promise<Restaurant[]> {
    try {
        const result = await query<Restaurant>('SELECT r.restaurant_id, r.name, r.address, r.url, r.latitude, r.longitude FROM restaurants r WHERE EXISTS (SELECT 1 FROM menus m WHERE m.restaurant_id = r.restaurant_id);');
        return result.rows;
    } catch {
        console.warn("Database connection failed, returning mock data for restaurants.");
        return [];
    }
}

export async function getFavouriteIds(userId: number): Promise<number[]> {
    try {
        const result = await query<{ restaurant_id: number }>('SELECT restaurant_id FROM favourites WHERE user_id = $1', [userId]);
        return result.rows.map(row => row.restaurant_id);
    } catch {
        return [];
    }
}

export async function getTodayMealsMap(): Promise<TodayMealsMap> {
    try {
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
    } catch {
        console.warn("Database connection failed, returning empty meals map.");
        return {};
    }
}

export async function getRestaurantRatingsMap(): Promise<RatingsMap> {
    try {
        const result = await query<{ restaurant_id: number, avg_stars: string, count: string }>(`
            SELECT restaurant_id, ROUND(AVG(stars), 1) as avg_stars, COUNT(stars) as count
            FROM reviews
            GROUP BY restaurant_id
        `);
        
        const ratingsMap: RatingsMap = {};
        for (const row of result.rows) {
            ratingsMap[row.restaurant_id] = { avg_stars: Number(row.avg_stars), count: Number(row.count) };
        }
        return ratingsMap;
    } catch {
        return {};
    }
}

export async function getRestaurantReviews(restaurantId: number): Promise<Review[]> {
    try {
        const result = await query<Review>(`
            SELECT r.user_id, r.restaurant_id, r.stars, r.review, u.username
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.restaurant_id = $1
            ORDER BY r.stars DESC
        `, [restaurantId]);
        return result.rows;
    } catch (e) {
        console.error("Failed to fetch reviews:", e);
        return [];
    }
}
