import React from 'react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="bg-blue-light p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Derniers articles</h2>
            <ul className="space-y-4">
              <li className="text-navy/80">Aucun article pour le moment.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
} 