import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-cream">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-blue px-3 py-1 text-sm text-cream">
            Stack technique 
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-navy">
              Les technologies au cœur du projet
            </h2>
            <p className="max-w-[900px] text-navy/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Découvrez les outils et frameworks qui rendent MokhtassarAI performant et moderne.
            </p>
          </div>
        </div>
                {/* Slider/carousel sur desktop avec défilement automatique */}
                <div className="hidden md:block relative overflow-x-hidden py-4">
          <div className="flex gap-8 animate-slide-horizontal w-max">
            {[
              { src: "/tech/react.png", name: "React", desc: "Construction de l'interface utilisateur interactive." },
              { src: "/tech/nextjs.png", name: "Next.js", desc: "Framework React pour le rendu côté serveur et le routage." },
              { src: "/tech/tailwind.png", name: "Tailwind CSS", desc: "Stylisation rapide et responsive de l'application." },
              { src: "/tech/fastapi.png", name: "FastAPI", desc: "API backend performante pour le traitement de la parole et l'IA." },
              // On répète pour la boucle
              { src: "/tech/react.png", name: "React", desc: "Construction de l'interface utilisateur interactive." },
              { src: "/tech/nextjs.png", name: "Next.js", desc: "Framework React pour le rendu côté serveur et le routage." },
              { src: "/tech/tailwind.png", name: "Tailwind CSS", desc: "Stylisation rapide et responsive de l'application." },
              { src: "/tech/fastapi.png", name: "FastAPI", desc: "API backend performante pour le traitement de la parole et l'IA." },
            ].map((tech, idx) => (
              <div key={idx} className="flex-shrink-0 w-80 md:w-96 flex flex-col items-center bg-white rounded-xl shadow p-10 mx-2">
                <img src={tech.src} alt={tech.name} className="h-20 w-20 mb-4" />
                <span className="text-navy font-semibold text-lg">{tech.name}</span>
                <p className="text-navy/80 text-base mt-4">{tech.desc}</p>
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes slide-horizontal {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-slide-horizontal {
              animation: slide-horizontal 30s linear infinite;
            }
          `}</style>
        </div>
        

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="rounded-lg bg-blue-light px-6 py-8">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-2xl font-bold text-navy">Prêt à transformer votre expérience audio ?</h3>
              <p className="text-navy/80">
                Commencez dès aujourd'hui et découvrez la puissance de Mokhtassar AI pour convertir la parole en texte et générer des résumés pertinents.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-navy text-cream hover:bg-navy/90">
                  Essayer gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}