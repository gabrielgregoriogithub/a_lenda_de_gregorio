import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vale da Lua — A Relíquia",
  description: "Uma aventura original em pixel art. Explore Elara, encontre a chave e recupere a Relíquia Lunar.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
