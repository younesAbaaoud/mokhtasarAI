"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";
import { Eye, Filter, Calendar, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/router";
import StudentLayout from "@/components/layout/StudentLayout";
import { withRoleGuard } from "@/utils/withRoleGuard";

interface Module {
  id: number;
  name: string;
  abreviation: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  module: Module;
  date: string;
  transcription: string;
  summary: string;
  professeur: string;
}

function EtudiantPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [professeurFilter, setProfesseurFilter] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedModule, dateFilter, searchQuery, professeurFilter]);

  const handleAuthError = () => {
    toast.error("Session expirée. Veuillez vous reconnecter.");
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch('http://localhost:8000/etudiant/cours', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error("Erreur lors du chargement des cours");
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch('http://localhost:8000/etudiant/modules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }

      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error("Erreur lors du chargement des modules");
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by module
    if (selectedModule && selectedModule !== "all") {
      filtered = filtered.filter(course => 
        course.module.id.toString() === selectedModule ||
        course.module.abreviation === selectedModule
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(course => {
        const courseDate = new Date(course.date);
        return courseDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.module.name.toLowerCase().includes(query) ||
        course.module.abreviation.toLowerCase().includes(query)
      );
    }

    // Filter by professeur
    if (professeurFilter) {
      const query = professeurFilter.toLowerCase();
      filtered = filtered.filter(course =>
        course.professeur.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const getModuleBadgeColor = (moduleAbbr: string): string => {
    const colors: { [key: string]: string } = {
      'ML': 'bg-blue-100 text-blue-800 border-blue-300',
      'DL': 'bg-purple-100 text-purple-800 border-purple-300',
      'JAVA': 'bg-orange-100 text-orange-800 border-orange-300',
      'MOB': 'bg-green-100 text-green-800 border-green-300',
      'WEB': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[moduleAbbr] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <StudentLayout>
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cours Disponibles</h1>
          <Tag className="ml-2 text-[#133E87]" size={24} />
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 border-gray-200 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter className="mr-2 text-[#133E87]" size={20} />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rechercher</label>
              <Input
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Tous les modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.abreviation} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Professeur</label>
              <Input
                placeholder="Rechercher un professeur..."
                value={professeurFilter}
                onChange={(e) => setProfesseurFilter(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-gray-200 rounded-lg bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-medium py-3 pl-4 text-[#133E87]">Nom du cours</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Module</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Professeur</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Date</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Aperçu</th>
                  <th className="text-right font-medium py-3 pr-4 text-[#133E87]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-200 hover:bg-[#133E87]/5">
                    <td className="py-3 pl-4 text-gray-900">{course.name}</td>
                    <td className="py-3">
                      <Badge 
                        variant="outline" 
                        className={`${getModuleBadgeColor(course.module.abreviation)} border`}
                        title={course.module.description}
                      >
                        {course.module.abreviation}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-900">{course.professeur}</td>
                    <td className="py-3 text-gray-500">
                      {(() => {
                        try {
                          const date = course.date ? new Date(course.date) : new Date();
                          if (isNaN(date.getTime())) {
                            return "Date invalide";
                          }
                          return format(date, 'dd MMMM yyyy', { locale: fr });
                        } catch (error) {
                          return "Date invalide";
                        }
                      })()}
                    </td>
                    <td className="py-3 text-gray-900">
                      <p className="line-clamp-1">
                        {course.transcription ? course.transcription.substring(0, 50) + "..." : "Aucune transcription"}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsModalOpen(true);
                          }}
                          className="text-[#133E87] hover:bg-[#133E87]/10"
                        >
                          <Eye size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Détails du cours
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom du cours</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Module</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getModuleBadgeColor(selectedCourse.module.abreviation)} border`}
                    >
                      {selectedCourse.module.abreviation}
                    </Badge>
                    <span className="text-sm text-gray-900">{selectedCourse.module.name}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Professeur</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.professeur}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {(() => {
                      try {
                        const date = new Date(selectedCourse.date);
                        if (isNaN(date.getTime())) {
                          return "Date invalide";
                        }
                        return format(date, 'dd MMMM yyyy', { locale: fr });
                      } catch (error) {
                        return "Date invalide";
                      }
                    })()}
                  </p>
                </div>
              </div>
              {selectedCourse.module.description && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description du module</h3>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-900">{selectedCourse.module.description}</p>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Transcription</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-900">{selectedCourse.transcription || "Transcription non disponible"}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Résumé</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-900">{selectedCourse.summary || "Résumé non disponible"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}

export default withRoleGuard(EtudiantPage, ["ETUDIANT"]);