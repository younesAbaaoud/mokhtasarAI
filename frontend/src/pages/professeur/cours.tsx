"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";
import { Eye, Pencil, Trash2, Filter, Calendar, Tag } from "lucide-react";
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
import ProfessorLayout from "@/components/layout/ProfessorLayout";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/router";

interface Course {
  id: string;
  name: string;
  module: string;
  date: string;
  transcription: string;
  summary: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedModule, dateFilter, searchQuery]);

  const handleAuthError = () => {
    toast.error("Session expirée. Veuillez vous reconnecter.");
    // Clear any stored data
    localStorage.removeItem('token');
    // Redirect to login page
    router.push('/auth/login');
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch('http://localhost:8000/professeur/cours', {
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
      console.log('Received courses data:', data); // Debug log
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error("Erreur lors du chargement des cours");
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by module
    if (selectedModule && selectedModule !== "all") {
      filtered = filtered.filter(course => course.module === selectedModule);
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
        course.module.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleDelete = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch(`http://localhost:8000/professeur/cours/${courseId}`, {
        method: 'DELETE',
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
        throw new Error('Failed to delete course');
      }

      // Show success toast with auto-dismiss
      toast.success("✅ Suppression réussie !", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#10B981",
          color: "white",
          border: "none",
          fontSize: "16px",
          padding: "16px",
        },
      });

      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error("❌ Erreur lors de la suppression", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
          fontSize: "16px",
          padding: "16px",
        },
      });
    }
  };

  const handleEdit = async () => {
    if (!editingCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch(`http://localhost:8000/professeur/cours/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingCourse.name,
          module: editingCourse.module,
          transcription: editingCourse.transcription,
          summary: editingCourse.summary
        })
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      // Show success toast with auto-dismiss
      toast.success("✅ Modification réussie !", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#10B981",
          color: "white",
          border: "none",
          fontSize: "16px",
          padding: "16px",
        },
      });

      // Close dialog and reset state
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      
      // Refresh the course list
      await fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error("❌ Erreur lors de la modification", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
          fontSize: "16px",
          padding: "16px",
        },
      });
    }
  };

  return (
    <ProfessorLayout>
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
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
              <label className="text-sm font-medium text-gray-700">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Tous les modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="mobile">Développement Mobile</SelectItem>
                  <SelectItem value="dl">Deep Learning</SelectItem>
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
                      <Badge variant="outline" className="border-[#133E87] text-[#133E87]">
                        {course.module}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">
                      {(() => {
                        try {
                          console.log('Course date value:', course.date); // Debug log
                          // Check if date is in ISO format
                          const date = course.date ? new Date(course.date) : new Date();
                          console.log('Parsed date:', date); // Debug log
                          if (isNaN(date.getTime())) {
                            console.log('Invalid date detected'); // Debug log
                            return "Date invalide";
                          }
                          return format(date, 'dd MMMM yyyy', { locale: fr });
                        } catch (error) {
                          console.error('Date formatting error:', error); // Debug log
                          return "Date invalide";
                        }
                      })()}
                    </td>
                    <td className="py-3 text-gray-900">
                      <p className="line-clamp-1">
                        {course.transcription ? course.transcription.substring(0, 50) + "..." : "Aucune transcription"}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-[#133E87] hover:bg-[#133E87]/10"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCourseToDelete(course);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer le cours "{courseToDelete?.name}" ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cette action est irréversible.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCourseToDelete(null);
              }}
              className="border-gray-200"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => courseToDelete && handleDelete(courseToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.module}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date d'ajout</h3>
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

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Modifier le cours
            </DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nom du cours</label>
                  <Input
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Module</label>
                  <Select
                    value={editingCourse.module}
                    onValueChange={(value) => setEditingCourse({ ...editingCourse, module: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Machine Learning</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="mobile">Développement Mobile</SelectItem>
                      <SelectItem value="dl">Deep Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Transcription</label>
                <textarea
                  value={editingCourse.transcription}
                  onChange={(e) => setEditingCourse({ ...editingCourse, transcription: e.target.value })}
                  className="w-full min-h-[100px] p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#133E87] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Résumé</label>
                <textarea
                  value={editingCourse.summary}
                  onChange={(e) => setEditingCourse({ ...editingCourse, summary: e.target.value })}
                  className="w-full min-h-[100px] p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#133E87] focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingCourse(null);
                  }}
                  className="border-gray-200"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-[#133E87] hover:bg-[#133E87]/90"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProfessorLayout>
  );
} 