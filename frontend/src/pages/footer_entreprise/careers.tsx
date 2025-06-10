import React from 'react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Carrières</h1>
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Rejoignez-nous</h2>
            <p className="text-navy/80">Aucune offre d'emploi pour le moment. Envoyez-nous votre candidature spontanée !</p>
          </section>
        </div>
      </div>
    </div>
  );
} 