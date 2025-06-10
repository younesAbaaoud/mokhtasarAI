"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import HeaderProf from "./HeaderProf";

interface ProfessorLayoutProps {
  children: React.ReactNode;
}

export default function ProfessorLayout({ children }: ProfessorLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 min-h-screen ${isCollapsed ? "ml-20" : "ml-64"} transition-all duration-300 bg-background`}>
        <HeaderProf isCollapsed={isCollapsed} />
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 