import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { sitioConfig } from "../../config/sitio.config";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: sitioConfig.titulo,
  description: sitioConfig.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="font-barlow antialiased bg-marino text-blanco">
        {children}
      </body>
    </html>
  );
}
