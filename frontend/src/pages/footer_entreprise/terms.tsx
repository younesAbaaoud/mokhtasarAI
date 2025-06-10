"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F3F3E0]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            href="/auth/register"
            className="inline-flex items-center text-[#133E87] hover:text-[#608BC1] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au register
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="bg-[#133E87] py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Conditions d'utilisation</h1>
          </div>
          
          <div className="p-8 space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">1. Introduction</h2>
              <p className="text-gray-700">
                Bienvenue sur Mokhtassar AI. Les présentes conditions générales régissent votre utilisation de notre site web et de nos services.
                En accédant à notre service, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">2. Description du service</h2>
              <p className="text-gray-700">
                Mokhtassar AI est un service en ligne qui permet aux utilisateurs de convertir la parole en texte et de créer des résumés concis à partir de contenu audio.
                Nous nous réservons le droit de modifier, suspendre ou interrompre, temporairement ou définitivement, tout ou partie du service sans préavis.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">3. Inscription et comptes</h2>
              <p className="text-gray-700">
                Pour utiliser certaines fonctionnalités de notre service, vous devez créer un compte. Vous êtes responsable du maintien de la confidentialité de votre compte et mot de passe,
                et de la restriction de l'accès à votre ordinateur. Vous acceptez la responsabilité de toutes les activités qui se produisent sous votre compte.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">4. Propriété intellectuelle</h2>
              <p className="text-gray-700">
                Le service et son contenu original, fonctionnalités et fonctionnalités sont et resteront la propriété exclusive de Mokhtassar AI et de ses concédants.
                Le service est protégé par le droit d'auteur, les marques et autres lois en France et à l'étranger.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">5. Utilisation acceptable</h2>
              <p className="text-gray-700">
                Vous acceptez de ne pas utiliser le service pour:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violer toute loi applicable</li>
                <li>Publier ou transmettre tout contenu illégal, menaçant, diffamatoire, obscène ou autrement répréhensible</li>
                <li>Usurper l'identité d'une personne ou d'une entité</li>
                <li>Interférer avec le fonctionnement normal du service</li>
                <li>Collecter ou stocker des données personnelles concernant d'autres utilisateurs</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">6. Limitation de responsabilité</h2>
              <p className="text-gray-700">
                Dans toute la mesure permise par la loi, Mokhtassar AI ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux, consécutifs ou punitifs,
                y compris la perte de profits, de données, d'utilisation, de bonne volonté ou d'autres pertes immatérielles, résultant de votre accès à ou utilisation du service.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">7. Modifications</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de modifier ou remplacer ces conditions à tout moment. Il est de votre responsabilité de vérifier périodiquement les modifications.
                Votre utilisation continue du service après la publication des conditions révisées signifie que vous acceptez et consentez aux changements.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">8. Contact</h2>
              <p className="text-gray-700">
                Si vous avez des questions concernant ces conditions, veuillez nous contacter à support@mokhtassar.ai.
              </p>
            </section>
            
            <div className="pt-4 border-t border-gray-200 text-gray-500 text-sm">
              <p>Dernière mise à jour: 8 mai 2025</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}