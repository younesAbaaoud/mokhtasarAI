"use client";

import { useState } from "react";
import HeaderProf from "./HeaderProf";
import Sidebar from "./sideBarStudent";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
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