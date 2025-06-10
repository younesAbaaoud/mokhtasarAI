import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-cream">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-navy">
                Convertissez la parole en texte et obtenez des résumés instantanés
              </h1>
              <p className="max-w-[600px] text-navy/80 md:text-xl">
                Mokhtassar AI transforme vos audios en texte précis et génère des résumés pertinents en quelques secondes.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="bg-navy text-cream hover:bg-navy/90">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/footer_entreprise/about">
                <Button size="lg" variant="outline" className="border-blue text-navy hover:bg-blue hover:text-cream">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] rounded-xl border border-blue-light shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-light to-blue">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-navy text-cream flex items-center justify-center mx-auto mb-4">
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
                        className="w-8 h-8"
                      >
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    </div>
                    <p className="text-xl font-medium mb-2 text-navy">Parlez simplement</p>
                    <p className="text-navy/80">
                      Notre IA convertit votre discours en texte avec une précision remarquable
                    </p>
                    <div className="mt-8 space-y-2 text-left bg-cream p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-navy mt-2"></div>
                        <p className="text-sm text-navy">Transcription précise</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-navy mt-2"></div>
                        <p className="text-sm text-navy">Support de la langue francais</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-navy mt-2"></div>
                        <p className="text-sm text-navy">Résumés instantanés</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}