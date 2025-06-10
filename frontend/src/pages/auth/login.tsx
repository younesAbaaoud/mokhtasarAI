"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, AlertCircle, User, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      // Redirection handled in AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email ou mot de passe invalide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F3E0]">
      {/* Hero Section - Unchanged */}
      <div className="hidden lg:block lg:w-1/2 bg-[#133E87] text-white">
        <div className="h-full flex flex-col items-center justify-center p-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Transformez la parole en résumés concis</h2>
            <p className="text-xl mb-8">
              Mokhtassar AI utilise des algorithmes avancés pour convertir votre parole en texte et
              générer des résumés pertinents en quelques secondes.
            </p>
            
            <div className="mb-12 bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#CBDCEB] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#133E87]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Comment ça marche</h3>
                  <ol className="space-y-3 list-decimal list-inside text-white/80">
                    <li>Téléchargez votre fichier audio ou enregistrez directement</li>
                    <li>Laissez notre IA transcrire votre parole en texte</li>
                    <li>Obtenez un résumé concis de votre contenu</li>
                    <li>Exportez dans le format de votre choix</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                "Économisez des heures de travail de transcription manuelle",
                "Extrayez les points clés des longs enregistrements",
                "Partagez le contenu résumé avec votre équipe"
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-[#CBDCEB] rounded-full p-2 mr-4">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 13L9 17L19 7" stroke="#133E87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section with improvements */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto w-full"
        >
          <Link href="/" className="block mb-8">
            <span className="font-bold text-2xl tracking-tight text-navy group-hover:scale-105 transition-transform">
              Mokhtassar<span className="text-blue">AI</span>
            </span>
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue</h1>
            <p className="text-gray-600 mt-2">Connectez-vous pour continuer vers Mokhtassar AI</p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center text-red-600">
                <AlertCircle size={18} className="mr-2" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre adresse email"
                  disabled={isLoading}
                  className="pl-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1]"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-[#133E87] hover:text-[#608BC1]"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  disabled={isLoading}
                  className="pl-10 pr-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={isLoading}
                className="h-4 w-4 border-gray-300 text-[#133E87]"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Se souvenir de moi
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 h-12 text-md bg-[#133E87] hover:bg-[#0c2b61] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </div>
              ) : "Se connecter"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/auth/register" className="text-[#133E87] hover:text-[#608BC1] font-medium">
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}