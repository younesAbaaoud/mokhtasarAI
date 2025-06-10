import React from 'react';

export default function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-blue-light/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-blue px-3 py-1 text-sm text-cream">
              Fonctionnalités
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-navy">
              La puissance de l'IA pour vos contenus audio
            </h2>
            <p className="max-w-[900px] text-navy/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Transformez vos fichiers audio en texte et obtenez des résumés instantanés avec notre IA avancée
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
          <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
            <div className="h-full w-full bg-gradient-to-br from-blue to-navy flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-cream text-navy flex items-center justify-center mb-4">
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-cream">Transcription précise</h3>
                <p className="text-cream/90">
                  Notre technologie avancée capture chaque mot avec une précision remarquable
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Speech-to-Text de pointe</h3>
                  <p className="text-navy/80">
                    Convertissez rapidement vos enregistrements audio en texte précis grâce à notre technologie IA avancée qui reconnaît parfaitement les nuances de la parole.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Prise en charge multilingue</h3>
                  <p className="text-navy/80">
                    Notre système prend en charge plus de 30 langues différentes, ce qui vous permet de transcrire des contenus dans votre langue préférée.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Haute fidélité audio</h3>
                  <p className="text-navy/80">
                    Notre algorithme est optimisé pour capturer avec précision même dans des environnements bruyants ou avec des accents variés.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
          <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full">
            <div className="h-full w-full bg-gradient-to-br from-blue to-navy flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-cream text-navy flex items-center justify-center mb-4">
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-cream">Résumés intelligents</h3>
                <p className="text-cream/90">
                  Obtenez l'essentiel de votre contenu en quelques secondes
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Résumés automatiques</h3>
                  <p className="text-navy/80">
                    Notre IA analyse le texte transcrit et génère automatiquement des résumés concis qui capturent les points essentiels.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Extraction de mots-clés</h3>
                  <p className="text-navy/80">
                    Identifiez rapidement les termes et concepts les plus importants de vos contenus grâce à notre système d'extraction de mots-clés.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-navy">Personnalisation des résumés</h3>
                  <p className="text-navy/80">
                    Ajustez la longueur et le style de vos résumés en fonction de vos besoins spécifiques pour obtenir exactement ce que vous recherchez.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}