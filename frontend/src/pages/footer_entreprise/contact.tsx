import React from 'react';
import Link from 'next/link';
import { Mail, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center mx-auto">
        <div className="max-w-md mx-auto w-full">
          
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Contactez-nous</h1>
            <p className="text-gray-600 mt-2">Envoyez-nous votre message et nous vous répondrons rapidement</p>
          </div>
          
          <form className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="w-full pl-10 h-12 bg-white border border-gray-200 rounded-md focus:border-[#608BC1] focus:ring-[#608BC1] focus:outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Votre email"
                  className="w-full pl-10 h-12 bg-white border border-gray-200 rounded-md focus:border-[#608BC1] focus:ring-[#608BC1] focus:outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Votre message"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:border-[#608BC1] focus:ring-[#608BC1] focus:outline-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-6 h-12 text-md bg-[#133E87] hover:bg-[#0c2b61] text-white rounded-md font-medium"
            >
              Envoyer le message
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Retour à l'accueil ?{" "}
              <Link href="/" className="text-[#133E87] hover:text-[#608BC1] font-medium">
                Accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}