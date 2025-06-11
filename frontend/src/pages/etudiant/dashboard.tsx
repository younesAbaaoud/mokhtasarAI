"use client";

import { useState, useRef, useEffect } from "react";

import {
  FileText,
  List,
  Clock,
  Settings,
  LogOut,
  File,
  X,
  Check,
  Loader2,
  Search,
  Moon,
  Sun,
  Mic,
  BookOpen,
  Tag,
  Calendar,
  Waves,
  Mic2,
  Square,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { withRoleGuard } from "@/utils/withRoleGuard";
import StudentLayout from "@/components/layout/StudentLayout";

function EtudiantDashboard() {
  
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file: File } | null>(null);
  
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const [selectedModule, setSelectedModule] = useState("");
  const [courseName, setCourseName] = useState("");
  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [recordingType, setRecordingType] = useState<'frontend' | 'python'>('frontend');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [recentUploads, setRecentUploads] = useState<Array<{
    name: string;
    date: string;
    status: string;
    type: string;
    transcription: string;
    summary: string;
  }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Upload Audio", icon: <Upload size={22} />, active: true },
    { name: "Mes Cours", icon: <FileText size={22} />, active: false },
    { name: "Liste Étudiants", icon: <List size={22} />, active: false },
    { name: "Historique", icon: <Clock size={22} />, active: false },
    { name: "Paramètres", icon: <Settings size={22} />, active: false },
  ];

 

  

 

  

  

  

 

  

  // Add this new useEffect to fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          router.push('/auth/login');
          return;
        }

        const response = await fetch('http://localhost:8000/professeur/cours', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        // Transform the courses data to match the table format
        const formattedCourses = courses.map((course: any) => ({
          name: course.name,
          type: course.module,
          date: new Date(course.time_inserted).toLocaleDateString('fr-FR'),
          transcription: course.transcription,
          summary: course.summary
        }));
        setRecentUploads(formattedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error("Erreur lors du chargement des cours");
      }
    };

    fetchCourses();
  }, []);


  // Add visibility change handler
 





  // Add beforeunload handler to warn about closing browser
 


  

  return (
    <StudentLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Audio</h1>
        <Waves className="ml-2 text-[#133E87]" size={24} />
          </div>
          
      

      {/* Recent uploads */}
      <Card className="border-gray-200 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <BookOpen className="mr-2 text-[#133E87]" size={20} />
            Cours récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-medium py-2 pl-2 rounded-tl-lg text-[#133E87]">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-2" />
                      <span>Nom du cours</span>
                    </div>
                  </th>
                  <th className="text-left font-medium py-2 text-[#133E87]">
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2" />
                      <span>Type</span>
                    </div>
                  </th>
                  <th className="text-left font-medium py-2 text-[#133E87]">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="text-left font-medium py-2 text-[#133E87]">
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2" />
                      <span>Aperçu</span>
                    </div>
                  </th>
                  <th className="text-left font-medium py-2 pr-2 rounded-tr-lg text-[#133E87]">
                    <div className="flex items-center">
                      <List size={16} className="mr-2" />
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((upload, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-[#133E87]/5 transition-colors"
                  >
                    <td className="py-3 pl-2 text-gray-900 rounded-bl-lg">{upload.name}</td>
                    <td className="py-3 text-gray-900">
                      <Badge variant="outline" className="border-[#133E87] text-[#133E87] rounded-lg">
                        {upload.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">{upload.date}</td>
                    <td className="py-3 text-gray-900">
                      <p className="text-sm line-clamp-1">
                        {upload.transcription ? upload.transcription.substring(0, 50) + "..." : "Aucune transcription"}
                      </p>
                    </td>
                    <td className="py-3 pr-2 rounded-br-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(upload);
                          setIsModalOpen(true);
                        }}
                        className="text-[#133E87] hover:bg-[#133E87]/10 rounded-lg"
                      >
                        <List size={16} className="mr-2" />
                        Voir détails
                      </Button>
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
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date d'ajout</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.date}</p>
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