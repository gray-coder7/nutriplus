import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriPlus",
  description: "Recetas, macros y lista de super para comer mejor",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-foreground/10">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/recetas" className="text-xl font-bold tracking-tight">
              Nutri<span className="text-coral">Plus</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-foreground/60">
              <Link href="/recetas" className="hover:text-foreground">
                Recetas
              </Link>
              <Link href="/plan" className="hover:text-foreground">
                Plan semanal
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
