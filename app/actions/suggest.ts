"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/rateLimit";

const suggestionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.union([
    z.literal(""),
    z.string().trim().url().max(2048),
  ]),
});

const SUGGESTION_LIMIT = 5;
const SUGGESTION_WINDOW_MS = 60 * 60 * 1000;

export async function sendSuggestion(name: string, url: string) {
  try {
    const parsed = suggestionSchema.safeParse({ name, url: url ?? "" });
    if (!parsed.success) {
      return { success: false, error: "Vyplňte prosím platný název a odkaz." };
    }

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwardedFor || headersList.get("x-real-ip") || "unknown";
    const limit = consumeRateLimit(`suggest:${ip}`, SUGGESTION_LIMIT, SUGGESTION_WINDOW_MS);

    if (!limit.allowed) {
      return {
        success: false,
        error: "Poslali jste příliš mnoho tipů. Zkuste to prosím později.",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });

    const mailTo = process.env.MAIL_TO;
    if (!mailTo) {
      throw new Error("MAIL_TO is not defined");
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.SMTP_USERNAME,
      to: mailTo,
      subject: `Tip na restauraci: ${parsed.data.name}`,
      text: `Uživatel aplikace poslal nový tip na restauraci!\n\nNázev: ${parsed.data.name}\nOdkaz: ${parsed.data.url || "(neuvedeno)"}\n`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Nepodařilo se odeslat e-mail." };
  }
}
