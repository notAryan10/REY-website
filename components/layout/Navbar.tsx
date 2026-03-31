"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Game Jams", href: "/gamejams" },
    { name: "Workshops", href: "/workshops" },
    { name: "Resources", href: "/resources" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b-2 border-border/50 py-3 shadow-2xl"
          : "bg-transparent py-8"
      }`}
    >
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-grass flex items-center justify-center pixel-border shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-transform"
          >
            <Rocket className="w-6 h-6 text-white" />
          </motion.div>
          <span className="font-pixel text-xl tracking-tighter text-white group-hover:text-grass transition-colors">
            R.E.Y
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-pixel text-[9px] lg:text-[10px] uppercase transition-all duration-200 relative group/link ${
                  isActive ? "text-grass" : "text-text-secondary hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-active"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-grass"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Button variant="grass" size="sm">
            Join Club
          </Button>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-card border-b-2 border-border p-6 md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-pixel text-[12px] uppercase ${
                      isActive ? "text-grass" : "text-text-secondary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border flex flex-col gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Login
                  </Button>
                </Link>
                <Button variant="grass" className="w-full">
                  Join Club
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
