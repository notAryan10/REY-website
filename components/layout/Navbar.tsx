"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket, User, LogOut, Shield, ChevronRight, Trophy } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { UserXP } from "../ui/UserXP";
import { LeaderboardCard } from "../dashboard/LeaderboardCard";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Game Jams", href: "/gamejams" },
    { name: "Projects", href: "/projects" },
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
          {status === "authenticated" ? (
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white font-pixel uppercase tracking-tighter truncate max-w-[120px]">
                    {session.user?.name}
                  </span>
                  <Badge variant={session.user?.role === 'architect' ? 'lava' : session.user?.role === 'respawner' ? 'sky' : 'stone'}>
                    {session.user?.role}
                  </Badge>
                </div>
                <UserXP level={4} xp={750} nextLevelXp={1000} />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                  className={`w-10 h-10 flex items-center justify-center rounded-sm border-2 transition-all duration-300 ${
                    isLeaderboardOpen 
                      ? "border-sand bg-sand/10 text-sand shadow-[0_0_15px_rgba(255,209,102,0.3)]" 
                      : "border-border text-text-secondary hover:border-sand hover:text-sand"
                  }`}
                  title="Leaderboard"
                >
                  <Trophy size={18} />
                </button>

                <Link href="/dashboard" className="group">
                  <div className="w-10 h-10 rounded-sm border-2 border-border flex items-center justify-center bg-zinc-900/80 group-hover:border-grass group-hover:shadow-[0_0_15px_rgba(76,175,80,0.3)] transition-all duration-300">
                    <User size={18} className="text-text-secondary group-hover:text-white" />
                  </div>
                </Link>

                <button 
                  onClick={() => signOut()}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-lava transition-colors group"
                  title="Log Out"
                >
                  <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Button variant="grass" size="sm">
                Join Club
              </Button>
            </>
          )}

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-8 border-b border-border/50">
                <span className="font-pixel text-lg text-white uppercase tracking-tighter">Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 flex items-center justify-center border-2 border-border text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-12 px-8">
                <div className="flex flex-col gap-8">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between font-pixel text-xl uppercase tracking-widest ${
                            isActive ? "text-grass" : "text-text-secondary"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                          <ChevronRight size={20} className={isActive ? "text-grass" : "text-border"} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              <div className="p-8 bg-card border-t-2 border-border">
                {status === "authenticated" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-900 border-2 border-border flex items-center justify-center">
                        <User size={32} className="text-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-pixel text-sm text-white mb-1 uppercase tracking-tighter">{session.user?.name}</p>
                        <UserXP level={4} xp={750} nextLevelXp={1000} showDetails />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/dashboard" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="secondary" size="lg" className="w-full text-[10px] font-pixel">Hub</Button>
                      </Link>
                      <button 
                        onClick={() => {
                          setIsLeaderboardOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full h-12 bg-zinc-900 border-2 border-sand/50 text-sand font-pixel text-[10px] flex items-center justify-center gap-2 hover:bg-sand/10 transition-colors"
                      >
                        <Trophy size={14} />
                        RANK
                      </button>
                    </div>
                    <Button variant="stone" size="lg" className="w-full text-[10px] font-pixel" onClick={() => signOut()}>Exit</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" size="lg" className="w-full">Login</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="grass" size="lg" className="w-full">Join Club</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isLeaderboardOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-end pt-24 pr-4 md:pr-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeaderboardOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.9, rotateX: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-background border-2 border-sand shadow-[0_0_50px_rgba(255,209,102,0.2)] p-6 overflow-hidden max-h-[80vh] overflow-y-auto"
              style={{ perspective: "1000px" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sand to-transparent" />
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="text-sand" size={20} />
                  <span className="font-pixel text-xs text-white uppercase tracking-widest">Global Rankings</span>
                </div>
                <button 
                  onClick={() => setIsLeaderboardOpen(false)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <LeaderboardCard />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
