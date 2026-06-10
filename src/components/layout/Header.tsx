"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Moon, Sun, Menu, X, Utensils } from "lucide-react";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

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
            茶饮
          </Link>
          <Link
            href="/categories/soup"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            养生汤
          </Link>
          <Link
            href="/categories/dessert"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            甜品
          </Link>
          <Link
            href="/categories/home-cooking"
            className="text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400 transition-colors"
          >
            家常菜
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors"
            aria-label="搜索"
          >
            <Search className="h-5 w-5" />
          </Link>

          <button
            onClick={toggleDark}
            className="rounded-lg p-2 text-foreground/60 hover:text-tea-600 hover:bg-tea-50 dark:hover:bg-tea-900/30 transition-colors"
            aria-label="切换主题"
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
          <Link
            href="/categories/tea"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            茶饮
          </Link>
          <Link
            href="/categories/soup"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            养生汤
          </Link>
          <Link
            href="/categories/dessert"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            甜品
          </Link>
          <Link
            href="/categories/home-cooking"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            家常菜
          </Link>
          <Link
            href="/search"
            className="block py-2 text-foreground/70 hover:text-tea-600 dark:hover:text-tea-400"
            onClick={() => setMenuOpen(false)}
          >
            搜索
          </Link>
        </div>
      )}
    </header>
  );
}
