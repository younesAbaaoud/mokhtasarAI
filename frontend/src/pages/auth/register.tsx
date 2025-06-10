"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Check, AlertCircle, User, Mail, Lock, GraduationCap, Briefcase } from "lucide-react";
import { authService } from '@/services/auth';

type Role = "student" | "teacher" | "";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Veuillez entrer une adresse e-mail valide";
    }
    
    if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    if (!role) {
      errors.role = "Veuillez sélectionner un rôle";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    if (!agreeTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.register({
        username: name,
        email,
        password,
        role: role === "teacher" ? "PROFESSEUR" : "ETUDIANT"
      });
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen bg-[#F3F3E0]">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <Link href="/" className="block mb-8">
            <span className="font-bold text-2xl tracking-tight text-navy group-hover:scale-105 transition-transform">
              Mokhtassar<span className="text-blue">AI</span>
            </span>
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rejoindre Mokhtassar AI</h1>
            <p className="text-gray-600 mt-2">Créez un compte pour commencer à résumer votre contenu audio</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">Nom Complet</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <User size={18} />
                </div>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="pl-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1]"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="role" className="text-sm font-medium">Rôle</Label>
              <div className="relative">
                <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger className={`h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1] ${formErrors.role ? 'border-red-500' : ''}`}>
                    <div className="flex items-center">
                      {role === "teacher" && <Briefcase size={16} className="mr-2 text-gray-500" />}
                      {role === "student" && <GraduationCap size={16} className="mr-2 text-gray-500" />}
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2 text-gray-500" />
                        <span>Professeur</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center">
                        <GraduationCap size={16} className="mr-2 text-gray-500" />
                        <span>Étudiant</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {formErrors.role}
                  </div>
                )}
              </div>
            </div>
            
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
                  placeholder="Votre adresse email"
                  required
                  className={`pl-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1] ${formErrors.email ? 'border-red-500' : ''}`}
                />
                {formErrors.email && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {formErrors.email}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Créez un mot de passe"
                  required
                  className={`pl-10 pr-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1] ${formErrors.password ? 'border-red-500' : ''}`}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {formErrors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {formErrors.password}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmez le mot de passe</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  required
                  className={`pl-10 pr-10 h-12 bg-white border-gray-200 focus:border-[#608BC1] focus:ring-[#608BC1] ${!passwordsMatch || formErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button 
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {(formErrors.confirmPassword || !passwordsMatch) && confirmPassword && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {formErrors.confirmPassword || "Les mots de passe ne correspondent pas"}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="terms" 
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                required
                className="h-4 w-4 border-gray-300 text-[#133E87]"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                J'accepte les{" "}
                <Link href="/terms" className="text-[#133E87] hover:text-[#608BC1] underline">
                  Conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-[#133E87] hover:text-[#608BC1] underline">
                  Politique de confidentialité
                </Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 h-12 text-md bg-[#133E87] hover:bg-[#0c2b61] text-white"
              disabled={isLoading || !passwordsMatch || !agreeTerms}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création du compte...
                </div>
              ) : "Créer un compte"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="text-[#133E87] hover:text-[#608BC1] font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:block lg:w-1/2 bg-[#133E87] text-white">
        <div className="h-full flex flex-col items-center justify-center p-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Transformez Votre Contenu Audio</h2>
            <p className="text-xl mb-8">
              Avec Mokhtassar AI, convertissez la parole en texte et créez des résumés concis de votre contenu en quelques clics.
            </p>
            <div className="grid grid-cols-1 gap-6">
              {[
                "Technologie de reconnaissance vocale précise",
                "Algorithmes de résumé intelligents",
                "Support multilingue pour un contenu global"
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-[#CBDCEB] rounded-full p-2 mr-4">
                    <Check className="h-5 w-5 text-[#133E87]" />
                  </div>
                  <p className="text-lg">{feature}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-[#608BC1]/30 rounded-lg border border-white/20">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-[#CBDCEB] flex items-center justify-center mr-4 mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#133E87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="#133E87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9H9.01" stroke="#133E87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 9H15.01" stroke="#133E87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-lg italic">
                    "Mokhtassar AI a révolutionné la façon dont je traite mes enregistrements de cours. Les résumés sont précis et me font gagner des heures de travail."
                  </p>
                  <p className="mt-3 font-medium">- M. Youssef, Data Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}