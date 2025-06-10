"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? 'border-b border-blue/20 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80 shadow-sm' 
          : 'bg-cream'
      }`}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex items-center">
            <span className="font-bold text-2xl tracking-tight text-navy group-hover:scale-105 transition-transform">
              Mokhtassar<span className="text-blue">AI</span>
            </span>
            <div className="ml-2 h-6 w-6 rounded-full bg-blue-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#133E87" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="#features">Fonctionnalités</NavLink>
          <NavLink href="#team">Équipe</NavLink>
          <NavLink href="#pricing">Stack technique </NavLink>
          <NavLink href="#about">À propos</NavLink>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <div className="space-x-4" >
            <Link className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90" href="/auth/login">
             Connexion
            </Link>
          </div>
          
          <Link href="/auth/register">
            <Button className="bg-blue text-cream hover:bg-blue/90">
              Démarrer
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex md:hidden items-center justify-center rounded-full p-2 text-navy bg-blue-light/50 hover:bg-blue-light"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-blue/20 bg-cream"
          >
            <div className="container py-4 space-y-4">
              <motion.nav 
                className="flex flex-col space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>
                  Fonctionnalités
                </MobileNavLink>
                <MobileNavLink href="#team" onClick={() => setIsMenuOpen(false)}>
                  Équipe
                </MobileNavLink>
                <MobileNavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>
                Stack technique 
                </MobileNavLink>
                <MobileNavLink href="#about" onClick={() => setIsMenuOpen(false)}>
                  À propos
                </MobileNavLink>
              </motion.nav>
              <div className="flex flex-col space-y-3 pt-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-cream">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-blue text-cream hover:bg-blue/90">
                    Démarrer
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Composant de lien de navigation pour desktop
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="relative group">
      <span className="px-3 py-2 text-sm font-medium text-navy transition-colors rounded-full hover:bg-blue-light/30 inline-flex items-center">
        {children}
      </span>
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue transform -translate-x-1/2 group-hover:w-1/2 transition-all duration-300" />
    </Link>
  );
};

// Composant de lien de navigation pour mobile
const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
    >
      <Link 
        href={href}
        className="text-base font-medium text-navy bg-blue-light/10 hover:bg-blue-light/30 px-4 py-2 rounded-lg block transition-colors"
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};