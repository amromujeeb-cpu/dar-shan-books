import type { Metadata } from "next";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";
import { ExperienceProvider } from "@/lib/experience-context";
import { CommerceProvider } from "@/lib/commerce-context";

export const metadata: Metadata = {
  title: "دار شأن للنشر والتوزيع",
  description: "لكل كتاب... شأنه.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo bg-white text-ink">
        <AuthProvider><StoreProvider><CartProvider><ExperienceProvider><CommerceProvider>{children}</CommerceProvider></ExperienceProvider></CartProvider></StoreProvider></AuthProvider>
      </body>
    </html>
  );
}
