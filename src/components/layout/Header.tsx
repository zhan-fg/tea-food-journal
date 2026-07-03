"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Moon, Sun, Menu, X, Utensils, Globe } from "lucide-react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

type Lang = "zh" | "en";

const NAV_LABELS: Record<Lang, Record<string, string>> = {
  zh: {
    tea: "茶饮",
    soup: "养生汤",
    dessert: "甜品",
    "home-cooking": "家常菜",
  },
  en: {
    tea: "Tea",
    soup: "Soup",
    dessert: "Dessert",
    "home-cooking": "Home Cooking",
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
    const saved = getCookie("lang");
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleLang = useCallback(async () => {
    const next = lang === "zh" ? "en" : "zh";
    setCookie("lang", next);
    setLang(next);
    // On detail pages, navigate to the translated page; elsewhere, refresh.
    try {
      const res = await fetch(
        `/api/translate?path=${encodeURIComponent(pathname)}`
      );
      const data = await res.json();
      if (data.translatedPath) {
        router.push(data.translatedPath);
        return;
      }
    } catch {
      // fall through to refresh
    }
    router.refresh();
  }, [lang, router, pathname]);

  const labels = NAV_LABELS[lang];
  const langLabel = lang === "zh" ? "EN" : "中文";

  const navLinks = (
    <>
      {(["tea", "soup", "dessert", "home-cooking"] as const).map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
          onClick={() => setMenuOpen(false)}
        >
          {labels[cat]}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-tea-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-tea-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-tea-700 hover:text-tea-600 dark:text-tea-400 dark:hover:text-tea-300 transition-colors"
        >
          <Utensils className="h-5 w-5" />
          <span className="hidden sm:inline">Tea &amp; Food Journal</span>
          <span className="sm:hidden">T&amp;FJ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/categories/tea"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            {labels.tea}
          </Link>
          <Link
            href="/categories/soup"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            {labels.soup}
          </Link>
          <Link
            href="/categories/dessert"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            {labels.dessert}
          </Link>
          <Link
            href="/categories/home-cooking"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            {labels["home-cooking"]}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors"
            aria-label={lang === "zh" ? "搜索" : "Search"}
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Language switch */}
          <button
            onClick={toggleLang}
            className="rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors flex items-center gap-1"
            aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
            title={lang === "zh" ? "Switch to English" : "切换到中文"}
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{langLabel}</span>
          </button>

          <button
            onClick={toggleDark}
            className="rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors"
            aria-label={lang === "zh" ? "切换主题" : "Toggle theme"}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors"
            aria-label="菜单"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-tea-200 dark:border-tea-800 px-4 py-3 space-y-2">
          {navLinks}
          <Link
            href="/search"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            {lang === "zh" ? "搜索" : "Search"}
          </Link>
        </div>
      )}
    </header>
  );
}
