"use client";

import React from 'react';
import Image from 'next/image';

const TeamSection = () => {
  const team = [
    {
      name: "Soukayna TAHIRI",
      role: "Data Scientist et Frontend Développeur",
      bio: "Spécialiste en traitement de données et conception d'interfaces utilisateur intuitives.",
      imageSrc: "/team/soukayna1.png",
      education: "ENIAD Berkane",
      links: {
        linkedin: "https://www.linkedin.com/in/soukayna-tahiri-542269238/",
        github: "https://github.com/soukayna-thr",
      },
    },
    {
      name: "Younes ABAAOUD",
      role: "Data Scientist et Backend Développeur",
      bio: "Expert en intelligence artificielle et développement de solutions backend robustes.",
      imageSrc: "/team/younes.png",
      education: "ENIAD Berkane",
      links: {
        linkedin: "https://www.linkedin.com/in/abaaoud-younes-8bb1762ab/",
        github: "https://github.com/younesAbaaoud",
      },
    },
    {
      name: "Chayma EL MAKKAOUI",
      role: "Data Scientist et Frontend Développeur",
      bio: "Spéciaiste la visualisation de données et la création d'expériences utilisateur exceptionnelles.",
      imageSrc: "/team/chayma.png",
      education: "ENIAD Berkane",
      links: {
        linkedin: "https://www.linkedin.com/in/chayma-el-makkaoui-195175232/",
        github: "https://github.com/Chayma-EL-MAKKAOUI",
      },
    },
  ];

  return (
    <section id="team" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-navy via-blue to-blue-light">
      <div className="container px-4 md:px-6 text-cream">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-3 max-w-[800px]">
            <div className="inline-block bg-cream text-navy font-semibold px-3 py-1 rounded-full text-sm mb-4">
              Notre Équipe
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-cream">
              Rencontrez les Esprits Créatifs
            </h2>
            <p className="text-cream/80 md:text-xl/relaxed max-w-[700px] mx-auto">
              Des talents passionnés par l'IA, la science des données et le développement web, tous formés à l'ENIAD Berkane
            </p>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3 mx-auto max-w-5xl">
          {team.map((member, index) => (
            <div 
              key={member.name}
              className="flex flex-col items-center text-center p-6 bg-cream/10 backdrop-blur-sm rounded-xl border border-cream/20 hover:border-cream/40 transition-all"
            >
              <div className="w-40 h-40 mb-6 relative overflow-hidden rounded-full border-4 border-cream/30">
                <img 
                  src={member.imageSrc} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-blue-light font-medium mb-3">{member.role}</p>
              <p className="text-cream/70 mb-4 text-sm">{member.bio}</p>
              
              <div className="px-3 py-1 bg-blue text-cream/90 text-xs rounded-full mb-5">
                {member.education}
              </div>
              
              <div className="flex space-x-3 mt-auto">
                {member.links.linkedin && (
                  <a href={member.links.linkedin} className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
                {member.links.github && (
                  <a href={member.links.github} className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 transition-colors">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                )}
            
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-block bg-cream/10 backdrop-blur-sm border border-cream/20 px-6 py-4 rounded-xl">
            <p className="text-cream font-medium">
              Notre équipe cumule des années d'expérience en intelligence artificielle et développement web, toute formée à
              <span className="font-bold"> l'École Nationale d'Intelligence Artificielle et du Digital (ENIAD) de Berkane</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;