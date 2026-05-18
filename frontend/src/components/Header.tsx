"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Palette } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Palette className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Chroma AI
          </span>
        </Link>

        <div className="flex items-center space-x-6 relative">
          <nav className="hidden md:flex items-center space-x-6 relative">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary relative ${
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                    layoutId="navbar-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 relative">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: mounted && theme === "dark" ? 0 : 1,
                    opacity: mounted && theme === "dark" ? 0 : 1,
                    rotate: mounted && theme === "dark" ? -90 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    scale: mounted && theme === "dark" ? 1 : 0,
                    opacity: mounted && theme === "dark" ? 1 : 0,
                    rotate: mounted && theme === "dark" ? 0 : 90,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
