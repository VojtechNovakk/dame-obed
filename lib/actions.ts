"use server";

import { query } from '@/lib/db';
import bcrypt from "bcryptjs";

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


export async function registerUser(formData: FormData) {
    const email = formData.get("email")?.toString();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !username || !password) {
        return { error: "Všechna pole jsou povinná." };
    }

    try {
        const existing = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existing.rows.length > 0) {
            return { error: "Uživatel s tímto e-mailem nebo jménem už existuje." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', 
            [email, username, hashedPassword]
        );

        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Došlo k chybě při registraci. Zkuste to prosím znovu." };
    }
}
