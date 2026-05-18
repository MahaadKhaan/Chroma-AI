import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chroma AI | Next-Gen Image Colorization",
  description: "Advanced AI image colorization with multi-model architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased relative" style={{ position: "relative" }}>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen w-full relative flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Ambient Glow Orbs */}
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
          
          <Header />
          <main className="flex-1 flex flex-col relative">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
