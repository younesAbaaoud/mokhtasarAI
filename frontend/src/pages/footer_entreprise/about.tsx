import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">À Propos de Mokhtassar AI</h1>
        
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
            <p className="text-navy/80">
              Chez Mokhtassar AI, nous nous engageons à révolutionner la façon dont les gens interagissent avec le contenu audio. 
              Notre mission est de rendre l'information plus accessible et plus facile à comprendre grâce à notre technologie d'IA avancée.
            </p>
          </section>

          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Notre Vision</h2>
            <p className="text-navy/80">
              Nous aspirons à devenir le leader mondial dans le domaine de la transcription et du résumé automatique, 
              en offrant des solutions innovantes qui transforment la parole en texte de manière précise et efficace.
            </p>
          </section>

          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Notre Équipe</h2>
            <p className="text-navy/80">
              Notre équipe est composée d'experts passionnés en intelligence artificielle, 
              en traitement du langage naturel et en développement logiciel. 
              Nous travaillons ensemble pour créer des solutions qui font la différence.
            </p>
          </section>

          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Nos Valeurs</h2>
            <ul className="list-disc list-inside space-y-2 text-navy/80">
              <li>Innovation continue</li>
              <li>Excellence technique</li>
              <li>Service client exceptionnel</li>
              <li>Intégrité et transparence</li>
              <li>Impact positif sur la société</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
} 