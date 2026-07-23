"use server";

import { query } from '@/lib/db';

export async function getMenu(restaurantId: number) {
    const result = await query(`
        SELECT m.menu_id, m.valid_for_date, ml.name, ml.price
        FROM menus m
        JOIN meals ml USING(menu_id)
        WHERE m.restaurant_id = $1 AND m.valid_for_date >= CURRENT_DATE
        ORDER BY m.valid_for_date ASC;
    `, [restaurantId]);

    return result.rows;
}
