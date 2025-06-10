"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfessorLayout from "@/components/layout/ProfessorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, GraduationCap, BookOpen, Clock, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [coursesCount, setCoursesCount] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          return;
        }

        const response = await fetch('http://localhost:8000/professeur/cours', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        setCoursesCount(courses.length);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error("Erreur lors du chargement des cours");
      }
    };

    fetchCourses();
  }, []);

  // Get user data from auth context
  const professorData = {
    name: user?.name || "Non défini",
    email: user?.email || "Non défini",
    phone: user?.phone || "Non défini",
    department: user?.department || "Non défini",
    specialization: user?.specialization || "Non défini",
    location: user?.location || "Non défini",
    courses: coursesCount,
    students: user?.students || 0,
    experience: user?.experience || "Non défini",
    bio: user?.bio || "Aucune biographie disponible.",
    education: user?.education || [
      {
        degree: "Non défini",
        institution: "Non défini",
        year: "Non défini"
      }
    ]
  };

  return (
    <ProfessorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Mon Profil</h1>
            <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#133E87] text-white hover:bg-[#133E87]/90 flex items-center gap-2"
          >
            <Edit2 size={16} />
            {isEditing ? "Annuler" : "Modifier le profil"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <Card className="md:col-span-1 border border-gray-200 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-[#133E87]/10">
                  <AvatarFallback className="text-2xl bg-[#133E87]/10 text-[#133E87]">
                    {professorData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl text-navy">{professorData.name}</CardTitle>
                  <p className="text-blue mt-1">{professorData.specialization}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={18} className="text-[#133E87]" />
                  <span>{professorData.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={18} className="text-[#133E87]" />
                  <span>{professorData.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin size={18} className="text-[#133E87]" />
                  <span>{professorData.location}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[#133E87]/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-[#133E87]">{professorData.courses}</p>
                    <p className="text-sm text-gray-500">Cours</p>
                  </div>
                  <div className="bg-[#133E87]/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-[#133E87]">{professorData.students}</p>
                    <p className="text-sm text-gray-500">Étudiants</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-navy">
                  <BookOpen size={20} className="text-[#133E87]" />
                  <span>À propos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{professorData.bio}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-navy">
                  <GraduationCap size={20} className="text-[#133E87]" />
                  <span>Formation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {professorData.education.map((edu, index) => (
                    <div key={index} className="flex justify-between items-start bg-[#133E87]/5 p-4 rounded-lg">
                      <div>
                        <p className="font-medium text-navy">{edu.degree}</p>
                        <p className="text-sm text-gray-500 mt-1">{edu.institution}</p>
                      </div>
                      <span className="text-sm text-blue font-medium">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-navy">
                  <Clock size={20} className="text-[#133E87]" />
                  <span>Expérience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start bg-[#133E87]/5 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-navy">Professeur d'Informatique</p>
                      <p className="text-sm text-gray-500 mt-1">Université Mohammed V</p>
                    </div>
                    <span className="text-sm text-blue font-medium">{professorData.experience}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
} 