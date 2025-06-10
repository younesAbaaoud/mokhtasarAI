import React from 'react';
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="about" className="w-full py-12 bg-navy text-cream">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-cream">Mokhtassar AI</h3>
            <p className="text-sm text-cream/80">
              Transformez la parole en texte et obtenez des résumés pertinents en quelques secondes grâce à notre technologie IA avancée.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-cream">Produit</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/#features" className="text-sm text-cream/70 hover:text-cream">
                Fonctionnalités
              </Link>
              <Link href="/#pricing" className="text-sm text-cream/70 hover:text-cream">
              Stack technique
              </Link>
              <Link href="/documentation" className="text-sm text-cream/70 hover:text-cream">
                Documentation
              </Link>
              <Link href="/api" className="text-sm text-cream/70 hover:text-cream">
                API
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-cream">Entreprise</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/footer_entreprise/about" className="text-sm text-cream/70 hover:text-cream">
                À propos
              </Link>
              <Link href="/footer_entreprise/blog" className="text-sm text-cream/70 hover:text-cream">
                Blog
              </Link>
              <Link href="/footer_entreprise/careers" className="text-sm text-cream/70 hover:text-cream">
                Carrières
              </Link>
              <Link href="/footer_entreprise/contact" className="text-sm text-cream/70 hover:text-cream">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-cream">Légal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/footer_entreprise/privacy" className="text-sm text-cream/70 hover:text-cream">
                Politique de confidentialité
              </Link>
              <Link href="/footer_entreprise/terms" className="text-sm text-cream/70 hover:text-cream">
                Conditions d'utilisation
              </Link>
              
            </nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-blue/30 pt-10 md:flex-row">
          <p className="text-sm text-cream/70">
            © 2025 Mokhtassar AI. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="https://twitter.com" className="text-cream/70 hover:text-cream">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://github.com" className="text-cream/70 hover:text-cream">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://linkedin.com" className="text-cream/70 hover:text-cream">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}