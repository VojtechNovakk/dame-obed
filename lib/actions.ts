"use server";

import { auth } from '@/auth';
import { query } from '@/lib/db';
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Restaurant, MenuMeal } from './types';

// Zod schema for registration validation
const registerSchema = z.object({
    email: z.string().email("Zadejte platnou e-mailovou adresu."),
    username: z.string().min(2, "Uživatelské jméno musí mít alespoň 2 znaky.").max(50, "Uživatelské jméno může mít maximálně 50 znaků."),
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
});

// Escapes LIKE meta-characters to prevent LIKE pattern injection
function escapeLikePattern(input: string): string {
    return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export async function getMenu(restaurantId: number): Promise<MenuMeal[]> {
    const result = await query<MenuMeal>(`
        SELECT m.menu_id, m.valid_for_date, ml.meal_id, ml.name, ml.price
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

    // Validate with zod
    const validation = registerSchema.safeParse({ email, username, password });
    if (!validation.success) {
        const firstError = validation.error.issues[0]?.message;
        return { error: firstError || "Neplatné údaje." };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', 
            [email, username, hashedPassword]
        );

        return { success: true };
    } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code === '23505') {
            return { error: "Uživatel s tímto e-mailem nebo jménem už existuje." };
        }

        console.error(err);
        return { error: "Došlo k chybě při registraci. Zkuste to prosím znovu." };
    }
}

export async function searchRestaurants(queryString: string): Promise<Restaurant[]> {
    const escaped = escapeLikePattern(queryString);
    const result = await query<Restaurant>(`
        SELECT DISTINCT r.restaurant_id, r.name, r.address, r.url, r.latitude, r.longitude
        FROM restaurants r
        LEFT JOIN menus mn ON r.restaurant_id=mn.restaurant_id
        LEFT JOIN meals ml ON mn.menu_id=ml.menu_id
        WHERE LOWER(r.name) LIKE LOWER('%' || $1 || '%') 
        OR LOWER(ml.name) LIKE LOWER('%' || $1 || '%');`, [escaped]);
    return result.rows;
}

export async function searchTodayRestaurants(queryString: string): Promise<Restaurant[]> {
    const escaped = escapeLikePattern(queryString);
    const result = await query<Restaurant>(`
        SELECT DISTINCT r.restaurant_id, r.name, r.address, r.url, r.latitude, r.longitude
        FROM restaurants r
        JOIN menus mn ON r.restaurant_id=mn.restaurant_id AND mn.valid_for_date = CURRENT_DATE
        LEFT JOIN meals ml ON mn.menu_id=ml.menu_id
        WHERE LOWER(r.name) LIKE LOWER('%' || $1 || '%') 
        OR LOWER(ml.name) LIKE LOWER('%' || $1 || '%');`, [escaped]);
    return result.rows;
}

export async function getTodayRestaurants(): Promise<Restaurant[]> {
    const result = await query<Restaurant>(`
        SELECT DISTINCT r.restaurant_id, r.name, r.address, r.url, r.latitude, r.longitude
        FROM restaurants r
        JOIN menus mn ON r.restaurant_id = mn.restaurant_id
        WHERE mn.valid_for_date = CURRENT_DATE;
    `);
    return result.rows;
}

export async function addFavourite(restaurantId: number) {
    try{
        const session = await auth();
        const userId = session?.user?.id ? parseInt(session.user.id) : null;

        if (!userId) {
            return { error: "Pro tuto akci se musíte přihlásit." };
        }

        await query('INSERT INTO favourites (user_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, restaurantId]);
        return { success: true };
    }catch(err){
        console.error(err);
        return { error: "Došlo k chybě při přidávání do oblíbených. Zkuste to prosím znovu." };
    }
}

export async function removeFavourite(restaurantId: number) {
    try{
        const session = await auth();
        const userId = session?.user?.id ? parseInt(session.user.id) : null;

        if (!userId) {
            return { error: "Pro tuto akci se musíte přihlásit." };
        }

        await query('DELETE FROM favourites WHERE user_id = $1 AND restaurant_id = $2', [userId, restaurantId]);
        return { success: true };
    }catch(err){
        console.error(err);
        return { error: "Došlo k chybě při odstraňování z oblíbených. Zkuste to prosím znovu." };
    }
}