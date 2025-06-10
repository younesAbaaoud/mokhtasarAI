import React from "react";
import { Metadata } from "next";
import HeroSection from "@/components/landing/hero-section";
import FeatureSection from "@/components/landing/feature-section";
import CTASection from "@/components/landing/cta-section";
import TeamSection from "@/components/landing/team-section";
import Footer from "@/components/landing/footer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Mokhtassar AI - Speech to Text and Summarization",
  description: "Transform your speech into text and get powerful summarization with Mokhtassar AI",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <TeamSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
