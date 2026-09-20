import type { Metadata } from "next";
import { Fredoka, Manrope } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import { IconSprite } from "@/components/icon-sprite";
import { getPendingItemsCount } from "@/lib/shopping-list";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NutriPlus",
  description: "Recetas, macros y lista de super para comer mejor",
};

// El layout hace una consulta a la DB (badge de la lista de super) en cada
// render. Sin esto, Next intenta pre-renderizar algunas rutas en build time
// (con lo que haya en la DB en ese momento) y el build de Docker fallaría
// si DATABASE_URL no está disponible ahí. Toda la app es de datos en vivo,
// de un solo usuario — no hay beneficio real en generar nada estático.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pendingItems = await getPendingItemsCount();

  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-app-bg text-foreground">
        <IconSprite />
        <AppNav pendingItems={pendingItems} />
        <main className="flex min-w-0 flex-1 flex-col pb-[72px] sm:pb-0">{children}</main>
      </body>
    </html>
  );
}
