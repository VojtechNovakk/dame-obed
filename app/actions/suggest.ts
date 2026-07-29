"use server";

import nodemailer from "nodemailer";

export async function sendSuggestion(name: string, url: string) {
  try {
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
      subject: `Tip na restauraci: ${name}`,
      text: `Uživatel aplikace poslal nový tip na restauraci!\n\nNázev: ${name}\nOdkaz: ${url}\n`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Nepodařilo se odeslat e-mail." };
  }
}
