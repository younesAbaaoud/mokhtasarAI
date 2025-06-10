"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
          <div className="bg-[#133E87] py-6 px-8 flex items-center">
            <Shield className="text-white mr-3 h-6 w-6" />
            <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
          </div>
          
          <div className="p-8 space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">1. Introduction</h2>
              <p className="text-gray-700">
                Chez Mokhtassar AI, nous accordons une grande importance à la protection de votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre service.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">2. Informations que nous collectons</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-[#608BC1]">Informations personnelles</h3>
                <p className="text-gray-700">
                  Lorsque vous vous inscrivez à notre service, nous collectons les informations suivantes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Nom et prénom (si fournis)</li>
                  <li>Adresse email</li>
                  <li>Rôle (étudiant ou professeur)</li>
                  <li>Mot de passe (stocké de manière sécurisée)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-[#608BC1]">Données d'utilisation</h3>
                <p className="text-gray-700">
                  Nous recueillons également des informations sur la façon dont vous accédez et utilisez notre service:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Données de journal (adresse IP, type de navigateur, pages visitées)</li>
                  <li>Informations sur l'appareil</li>
                  <li>Fichiers audio téléchargés pour la transcription</li>
                  <li>Textes générés et résumés créés</li>
                </ul>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">3. Utilisation des informations</h2>
              <p className="text-gray-700">
                Nous utilisons les informations collectées pour:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Fournir, maintenir et améliorer notre service</li>
                <li>Traiter vos demandes et vous envoyer des informations relatives au service</li>
                <li>Personnaliser et améliorer votre expérience</li>
                <li>Développer de nouvelles fonctionnalités et services</li>
                <li>Détecter, prévenir et résoudre les problèmes techniques ou de sécurité</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">4. Partage des informations</h2>
              <p className="text-gray-700">
                Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons cependant partager vos informations dans les circonstances suivantes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Avec des fournisseurs de services tiers qui nous aident à exploiter notre service</li>
                <li>Pour se conformer à une obligation légale ou réglementaire</li>
                <li>Pour protéger les droits, la propriété ou la sécurité de Mokhtassar AI, de nos utilisateurs ou du public</li>
                <li>Avec votre consentement explicite</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">5. Sécurité des données</h2>
              <p className="text-gray-700">
                La sécurité de vos données est importante pour nous. Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès, altération, divulgation ou destruction non autorisés.
                Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est sécurisée à 100%.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">6. Conservation des données</h2>
              <p className="text-gray-700">
                Nous conserverons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales.
                Si vous souhaitez que nous supprimions vos données, veuillez nous contacter via les coordonnées fournies ci-dessous.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">7. Vos droits</h2>
              <p className="text-gray-700">
                En vertu du Règlement Général sur la Protection des Données (RGPD) et d'autres lois applicables, vous disposez de certains droits concernant vos données personnelles:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement (droit à l'oubli)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">8. Modifications de cette politique</h2>
              <p className="text-gray-700">
                Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page et en vous envoyant un email si les modifications sont significatives.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#133E87]">9. Contact</h2>
              <p className="text-gray-700">
                Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Par email: privacy@mokhtassar.ai</li>
              </ul>
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