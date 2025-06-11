"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  List,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: <Upload size={22} />, path: "/etudiant/dashboard" },
    { name: "Cours", icon: <FileText size={22} />, path: "/etudiant/cours" },
    { name: "Liste des professeurs", icon: <List size={22} />, path: "/etudiant/etudiants" },
    { name: "Historique", icon: <Clock size={22} />, path: "/etudiant/historique" },
    { name: "Paramètres", icon: <Settings size={22} />, path: "/etudiant/parametres" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className={`flex flex-col fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 transition-all duration-300 shadow-sm`}>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-xl tracking-tight text-navy">
              Mokhtassar<span className="text-blue">AI</span>
            </h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 mx-auto bg-[#133E87]/10 rounded-lg flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-gray-500 hover:bg-[#133E87]/10 rounded-lg"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <Separator className="bg-gray-200" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} mb-1 ${
                        isActive 
                          ? "bg-[#133E87] text-white hover:bg-[#133E87]/90" 
                          : "text-gray-600 hover:bg-[#133E87]/10"
                      } rounded-lg`}
                      onClick={() => router.push(item.path)}
                    >
                      <span>{item.icon}</span>
                      {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-white border-gray-200">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} text-red-500 hover:bg-red-50 rounded-lg`}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="ml-3">Déconnexion</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-white border-gray-200">
                <p>Déconnexion</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 