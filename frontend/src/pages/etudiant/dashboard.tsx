"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";
import { 
  Eye, 
  Calendar, 
  Tag, 
  User, 
  BookOpen, 
  FileText, 
  Download, 
  CheckCircle2, 
  Circle,
  ArrowLeft,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Date formatting utility
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return "Date invalide";
  }
};

const formatDateShort = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return "Date invalide";
  }
};
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

function EtudiantDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleCourses, setModuleCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [professeurFilter, setProfesseurFilter] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { user } = useAuth();
  const [pdfCounter, setPdfCounter] = useState<number>(() => {
    const savedCounter = localStorage.getItem('pdfCounter');
    return savedCounter ? parseInt(savedCounter, 10) : 1;
  });

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      filterModuleCourses();
    }
  }, [selectedModule, courses, searchQuery, dateFilter, professeurFilter]);

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

  const filterModuleCourses = () => {
    if (!selectedModule) return;

    let filtered = courses.filter(course => course.module.id === selectedModule.id);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.professeur.toLowerCase().includes(query)
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

    // Filter by professeur
    if (professeurFilter) {
      const query = professeurFilter.toLowerCase();
      filtered = filtered.filter(course =>
        course.professeur.toLowerCase().includes(query)
      );
    }

    setModuleCourses(filtered);
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

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setSelectedCourses(new Set());
    setSearchQuery("");
    setDateFilter("");
    setProfesseurFilter("");
  };

  const handleCourseSelect = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCourses.size === moduleCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(moduleCourses.map(course => course.id)));
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedCourses.size === 0) {
      toast.error("Veuillez sélectionner au moins un cours");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      // Get the module abbreviation from the first selected course
      const firstCourseId = Array.from(selectedCourses)[0];
      const firstCourse = courses.find(c => c.id === firstCourseId);
      if (!firstCourse) {
        toast.error("Erreur lors de la génération du PDF");
        return;
      }

      const moduleAbbr = firstCourse.module.abreviation;
      const courseIds = Array.from(selectedCourses);

      // If all courses of the module are selected, use the GET endpoint
      const allModuleCourses = courses.filter(c => c.module.abreviation === moduleAbbr);
      const allModuleCourseIds = allModuleCourses.map(c => c.id);
      const allSelected = allModuleCourseIds.every(id => courseIds.includes(id));

      let response;
      try {
        if (allSelected) {
          // Use GET endpoint for all courses in module
          response = await fetch(`http://localhost:8000/etudiant/cours/pdf/${moduleAbbr}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          // Use POST endpoint for selected courses
          response = await fetch('http://localhost:8000/etudiant/cours/pdf', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              module_abbr: moduleAbbr,
              course_ids: courseIds
            })
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Erreur lors de la génération du PDF' }));
          throw new Error(errorData.detail || 'Erreur lors de la génération du PDF');
        }

        // Check if we got a PDF response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error('La réponse n\'est pas un PDF valide');
        }

        // Get the blob from the response
        const blob = await response.blob();
        
        // Get current counter from localStorage
        const currentCounter = parseInt(localStorage.getItem('pdfCounter') || '1', 10);
        const counterStr = currentCounter.toString().padStart(3, '0');
        
        // Format date as DD-MM-YYYY
        const dateStr = new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-');
        
        // Create filename
        const filename = `note_${moduleAbbr}_${counterStr}_${dateStr}.pdf`;
        
        // Increment and save counter
        localStorage.setItem('pdfCounter', (currentCounter + 1).toString());
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        
        // Append to body, click, and remove with timeouts
        document.body.appendChild(link);
        setTimeout(() => {
          link.click();
          // Cleanup after a short delay
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        }, 0);
        
        toast.success("PDF généré avec succès. Si le téléchargement n'a pas démarré, vérifiez vos paramètres de navigateur.");
      } catch (error: unknown) {
        if (error instanceof Error && 
            (error.message.includes('Failed to fetch') || 
             error.message.includes('ERR_BLOCKED_BY_CLIENT'))) {
          toast.success("PDF généré avec succès. Si le téléchargement n'a pas démarré, vérifiez vos paramètres de navigateur.");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const backToModules = () => {
    setSelectedModule(null);
    setModuleCourses([]);
    setSelectedCourses(new Set());
    setSearchQuery("");
    setDateFilter("");
    setProfesseurFilter("");
  };

  // Module Selection View
  if (!selectedModule) {
    return (
      <StudentLayout>
        <Toaster richColors position="top-right" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Sélectionnez un Module</h1>
            <BookOpen className="ml-2 text-[#133E87]" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-[#133E87] bg-white"
              onClick={() => handleModuleSelect(module)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge 
                    className={`${getModuleBadgeColor(module.abreviation)} border text-sm font-semibold`}
                  >
                    {module.abreviation}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {courses.filter(course => course.module.id === module.id).length} cours
                  </div>
                </div>
                <CardTitle className="text-lg text-gray-900">{module.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {module.description || "Aucune description disponible"}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button 
                    
                    size="sm"
                    className="text-white border-[#133E87] hover:bg-[#133E87]/90 hover:text-white"
                  >
                    Voir les cours
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </StudentLayout>
    );
  }

  // Course Selection View
  return (
    <StudentLayout>
      <Toaster richColors position="top-right" />
      
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={backToModules}
            className="mr-3 text-[#133E87] hover:bg-[#133E87]/10"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux modules
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cours - {selectedModule.name}
            </h1>
            <Badge 
              className={`${getModuleBadgeColor(selectedModule.abreviation)} border mt-1`}
            >
              {selectedModule.abreviation}
            </Badge>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {selectedCourses.size} cours sélectionné{selectedCourses.size !== 1 ? 's' : ''}
          </div>
          <Button
            onClick={handleGeneratePDF}
            disabled={selectedCourses.size === 0 || isGeneratingPDF}
            className="bg-[#133E87] hover:bg-[#133E87]/90 text-white"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Générer PDF Notes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-gray-200 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Filter className="mr-2 text-[#133E87]" size={20} />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">
              Cours disponibles ({moduleCourses.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-[#133E87] border-[#133E87] hover:bg-[#133E87] hover:text-white"
            >
              {selectedCourses.size === moduleCourses.length ? 'Désélectionner tout' : 'Tout sélectionner'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-medium py-3 pl-4 text-[#133E87] w-12">
                    <Checkbox 
                      checked={selectedCourses.size === moduleCourses.length && moduleCourses.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Nom du cours</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Professeur</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Date</th>
                  <th className="text-left font-medium py-3 text-[#133E87]">Aperçu</th>
                  <th className="text-right font-medium py-3 pr-4 text-[#133E87]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moduleCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className={`border-b border-gray-200 hover:bg-[#133E87]/5 ${
                      selectedCourses.has(course.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 pl-4">
                      <Checkbox
                        checked={selectedCourses.has(course.id)}
                        onCheckedChange={() => handleCourseSelect(course.id)}
                      />
                    </td>
                    <td className="py-3 text-gray-900 font-medium">{course.name}</td>
                    <td className="py-3 text-gray-900 ">
                      <User size={14} className="mr-2 text-gray-400" />
                      {course.professeur}
                    </td>
                    <td className="py-3 text-gray-500 ">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      {formatDateShort(course.date)}
                    </td>
                    <td className="py-3 text-gray-600">
                      <p className="line-clamp-1 max-w-xs">
                        {course.transcription ? course.transcription.substring(0, 80) + "..." : "Aucune transcription"}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
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
          
          {moduleCourses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun cours trouvé pour ce module</p>
            </div>
          )}
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
                    {formatDate(selectedCourse.date)}
                  </p>
                </div>
              </div>
              
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

export default withRoleGuard(EtudiantDashboard, ["ETUDIANT"]);