"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
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
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import ProfessorLayout from "@/components/layout/ProfessorLayout";
import { withRoleGuard } from "@/utils/withRoleGuard";
import os from "os";

interface Course {
  id: number;
  name: string;
  module_id: number;
  professeur_id: number;
  transcription: string;
  summary: string;
  time_inserted: string;
  module: {
    id: number;
    name: string;
    abreviation: string;
  };
}

function ProfesseurDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file: Blob } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [recordingStatusInterval, setRecordingStatusInterval] = useState<NodeJS.Timeout | null>(null);
  const [pythonRecordingStatus, setPythonRecordingStatus] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [courseName, setCourseName] = useState("");
  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [recentUploads, setRecentUploads] = useState<Course[]>([]);
  const [modules, setModules] = useState<Array<{
    id: number;
    name: string;
  }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('File selected:', file);
      // Convert File to Blob
      const blob = file.slice(0, file.size, file.type);
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        file: blob
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCompleted(false);
    setProgress(0);
    setTranscription("");
    setSummary("");
    setIsSummarizing(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async () => {
    if (!uploadedFile) {
      toast.error("Veuillez d'abord télécharger un fichier audio");
      return;
    }

    setProcessing(true);
    setTranscription("");
    setSummary("");
    setIsSummarizing(false);

    try {
      const formData = new FormData();
      formData.append('audio_file', uploadedFile.file);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      // First, transcribe the audio
      const response = await fetch('http://localhost:8000/stt/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      
      // Then, generate summary
      setIsSummarizing(true);
      const summaryResponse = await fetch('http://localhost:8000/professeur/summarization', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: data.transcription
        })
      });

      if (summaryResponse.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
      setCompleted(true);
      toast.success("Transcription et résumé terminés avec succès");
    } catch (error) {
      console.error('Processing error:', error);
      if (error instanceof Error && error.message.includes('401')) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }
      toast.error(error instanceof Error ? error.message : "Erreur lors du traitement");
    } finally {
      setProcessing(false);
      setIsSummarizing(false);
    }
  };

  const saveTranscription = async () => {
    if (!selectedModule || !courseName) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

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
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          module_id: parseInt(selectedModule), // Use module_id instead of module
          name: courseName,
          transcription: transcription,
          summary: summary
        })
      });

      if (response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save course');
      }

      toast.success("Cours enregistré avec succès");
      
      // Reset the form
      setUploadedFile(null);
      setTranscription("");
      setSummary("");
      setSelectedModule("");
      setCourseName("");
      setCompleted(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh the courses list
      await fetchCourses();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
    }
  };

  // Add a debug function
  const debugLog = (message: string, data?: any) => {
    console.log(`[Recording Debug] ${message}`, data || '');
  };

  // Add a cleanup lock to prevent multiple simultaneous cleanups
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Simplified startRecording function
  const startRecording = async () => {
    debugLog('Start recording clicked');
    try {
      debugLog('Getting auth token');
      const token = localStorage.getItem('token');
      if (!token) {
        debugLog('No auth token found');
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      debugLog('Sending start recording request to backend');
      const response = await fetch('http://localhost:8000/professeur/microphone/start-python-recorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      debugLog('Backend response status:', response.status);
      const data = await response.json();
      debugLog('Backend response data:', data);
      
      if (response.ok) {
        debugLog('Recording started successfully');
        setIsRecording(true);
        setRecordingDuration(0);
        
        // Start the timer for UI
        const timer = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        setRecordingInterval(timer);

        // Start polling for recording status
        debugLog('Starting status polling');
        const statusInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch('http://localhost:8000/professeur/microphone/recording-status', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (statusResponse.ok) {
              const status = await statusResponse.json();
              debugLog('Recording status:', status);
              setPythonRecordingStatus(status);
              
              // Update duration from server if available
              if (status.duration) {
                setRecordingDuration(Math.floor(status.duration));
              }
              
              // If recording stopped on server side, update UI
              if (!status.recording && isRecording) {
                debugLog('Recording stopped on server side');
                await stopRecording();
              }
            }
          } catch (error) {
            debugLog('Status check error:', error);
          }
        }, 2000);
        
        setRecordingStatusInterval(statusInterval);
        
        toast.success('Enregistrement démarré. Appuyez sur ESC pour arrêter.');
      } else {
        debugLog('Start recording failed:', data);
        throw new Error(data.detail || 'Échec du démarrage de l\'enregistrement');
      }
    } catch (error) {
      debugLog('Recording error:', error);
      console.error('Error starting recording:', error);
      toast.error(error instanceof Error ? error.message : 'Échec du démarrage de l\'enregistrement');
    }
  };

  // Update stopRecording to handle cleanup
  const stopRecording = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token available');
      }

      debugLog('Stopping recording');
      const response = await fetch('http://localhost:8000/professeur/microphone/stop-python-recorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      debugLog('Stop recording response:', { status: response.status, data });
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          // If no recording was in progress, treat it as a success
          if (data.message === "No recording was in progress") {
            debugLog('No recording was in progress, treating as success');
            setIsRecording(false);
            setPythonRecordingStatus({ recording: false, duration: 0 });
            return;
          }
        }
        throw new Error(data.detail || `Failed to stop recording (${response.status})`);
      }
      
      // Update UI state immediately
      setIsRecording(false);
      setPythonRecordingStatus({ recording: false, duration: 0 });
      
      // Clear intervals
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      if (recordingStatusInterval) {
        clearInterval(recordingStatusInterval);
        setRecordingStatusInterval(null);
      }
      
      toast.success(data.message || 'Recording stopped');
      
      // Download and process the recorded file if we have one
      if (data.filename) {
        try {
          await downloadAndProcessPythonRecording(token);
        } catch (downloadError) {
          console.error('Error downloading recording:', downloadError);
          toast.error('Failed to download recording, but it was saved on the server');
          // Don't throw here, just log the error and continue with cleanup
        }
      }

      // Finally, do the cleanup
      debugLog('Cleaning up after recording');
      try {
        const cleanupResponse = await fetch('http://localhost:8000/professeur/microphone/cleanup', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (cleanupResponse.ok) {
          const cleanupData = await cleanupResponse.json();
          debugLog('Cleanup successful:', cleanupData);
        } else {
          debugLog('Cleanup failed:', cleanupResponse.status);
          // Don't throw here, just log the error
        }
      } catch (error) {
        debugLog('Cleanup error:', error);
        // Don't throw here, just log the error
      } finally {
        // Always reset states
        setIsRecording(false);
        setPythonRecordingStatus({ recording: false, duration: 0 });
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to stop recording');
      // Reset states even if there's an error
      setIsRecording(false);
      setPythonRecordingStatus({ recording: false, duration: 0 });
      setRecordingDuration(0);
    }
  };

  const downloadAndProcessPythonRecording = async (token: string): Promise<void> => {
    try {
      debugLog('Starting download of recording');
      
      // First check if the file exists
      const statusResponse = await fetch('http://localhost:8000/professeur/microphone/recording-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to get recording status');
      }
      
      const status = await statusResponse.json();
      debugLog('Recording status before download:', status);
      
      if (!status.filename) {
        throw new Error('No recording file found');
      }
      
      // Download the file
      debugLog('Downloading recording file');
      const response = await fetch('http://localhost:8000/professeur/microphone/download-recording', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'audio/wav'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        debugLog('Download failed:', { status: response.status, error: errorText });
        throw new Error(`Failed to download recording: ${errorText}`);
      }
      
      debugLog('Download successful, processing response');
      const headers = Object.fromEntries(response.headers.entries());
      debugLog('Response headers:', headers);
      
      // Get filename from headers - try X-Filename first, then Content-Disposition
      let fileName = status.filename; // Use filename from status as fallback
      
      // Try X-Filename header first
      const xFilename = response.headers.get('X-Filename');
      if (xFilename) {
        debugLog('Found filename in X-Filename header:', xFilename);
        fileName = xFilename;
      } else {
        // Try Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          debugLog('Content-Disposition header:', contentDisposition);
          // Try extended format first (filename*=UTF-8'')
          const extendedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
          if (extendedMatch && extendedMatch[1]) {
            fileName = decodeURIComponent(extendedMatch[1]);
            debugLog('Found filename in extended Content-Disposition:', fileName);
          } else {
            // Try standard format (filename="...")
            const standardMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (standardMatch && standardMatch[1]) {
              fileName = standardMatch[1];
              debugLog('Found filename in standard Content-Disposition:', fileName);
            }
          }
        }
      }
      
      debugLog('Final filename to be used:', fileName);
      
      // Get the blob and update UI
      const blob = await response.blob();
      debugLog('Blob received:', { size: blob.size, type: blob.type });
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Update the UI with the recorded file
      setUploadedFile({
        name: fileName,
        size: (blob.size / (1024 * 1024)).toFixed(2),
        file: blob
      });
      
      toast.success('Recording downloaded successfully. Click "Traiter l\'audio" to process it.');
    } catch (error) {
      console.error('Error in download:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download recording');
    }
  };

  const processRecordedAudio = async (audioBlob: Blob): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/stt/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      
      // Generate summary
      setIsSummarizing(true);
      const summaryResponse = await fetch('http://localhost:8000/professeur/summarization', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: data.transcription
        })
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary);
        setCompleted(true);
      }
      
      toast.success('Recording processed successfully');
    } catch (error) {
      toast.error('Failed to process recording');
      console.error('Processing error:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  // Fetch courses function
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
      console.log('Received courses from backend:', courses); // Debug log
      console.log('First course module:', courses[0]?.module); // Debug log for first course's module
      setRecentUploads(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error("Erreur lors du chargement des cours");
    }
  };

  // Fetch modules function
  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:8000/professeur/modules', {
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
        throw new Error('Failed to fetch modules');
      }

      const modulesData = await response.json();
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error("Erreur lors du chargement des modules");
    }
  };

  // useEffect to fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // useEffect to fetch modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Update the cleanup effect
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (isRecording) {
        // Stop recording when browser closes
        await stopRecording();
        // Show warning message
        e.preventDefault();
        e.returnValue = "Recording will be stopped when you close the browser.";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up if component unmounts
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isRecording) {
        // Show a notification that recording is still active
        toast.info("Recording continues in background. You can switch to other applications.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRecording]);

  // Add online/offline handlers
  useEffect(() => {
    const handleOnline = () => {
      if (isRecording) {
        toast.success("Connection restored");
      }
    };

    const handleOffline = () => {
      if (isRecording) {
        toast.error("Connection lost. Recording will be stopped.");
        stopRecording();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isRecording]);

  // Cleanup effect for recording interval
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  return (
    <ProfessorLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Audio</h1>
        <Waves className="ml-2 text-[#133E87]" size={24} />
      </div>

      {/* Upload card */}
      <Card className="mb-8 border-gray-200 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Mic2 className="mr-2 text-[#133E87]" size={24} />
            Télécharger un enregistrement de cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File upload area */}
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center bg-gray-50 hover:bg-[#133E87]/5 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-[#133E87]/10 rounded-full">
                  <Upload size={36} className="text-[#133E87]" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Déposez votre fichier audio ici</h3>
              <p className="text-sm text-gray-500 mb-4">ou</p>

              <div className="flex justify-center flex-col items-center">
                <Input
                  ref={fileInputRef}
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-48 h-12 rounded-lg border-2 border-[#133E87] text-[#133E87] hover:bg-[#133E87]/10"
                >
                  Parcourir les fichiers
                </Button>

                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <div className="mt-4 flex flex-col items-center">
                      <Button
                        onClick={startRecording}
                        className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-[#133E87] hover:bg-[#133E87]/90"
                      >
                        <Mic size={24} className="text-white" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Enregistrer</p>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full mr-2 animate-pulse bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(recordingDuration)}
                        </span>
                      </div>
                      <Button
                        onClick={stopRecording}
                        className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
                      >
                        <Square size={24} className="text-white" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Arrêter</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">Formats supportés: MP3, WAV, M4A (Max 500MB)</p>
            </div>
          ) : (
            <div className="bg-[#133E87]/5 rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-[#133E87]/10 p-2 rounded-lg mr-3">
                    <File size={24} className="text-[#133E87]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile?.name}</p>
                    <p className="text-sm text-gray-500">{uploadedFile?.size} MB</p>
                  </div>
                </div>
                {!processing && !completed && (
                  <Button variant="ghost" size="icon" onClick={removeFile} className="text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg">
                    <X size={20} />
                  </Button>
                )}
                {completed && (
                  <Badge className="bg-green-500 text-white rounded-lg">
                    <Check size={14} className="mr-1" /> Transcrit
                  </Badge>
                )}
              </div>

              {processing && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1 text-gray-900">
                    <span>Transcription en cours...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 rounded-lg bg-[#133E87]/10 text-[#133E87]" />
                </div>
              )}

              {transcription && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="mr-2 text-[#133E87]" size={20} />
                      Transcription
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{transcription}</p>
                    </div>
                  </div>

                  {isSummarizing && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#133E87]" />
                        <span className="text-sm text-gray-900">Génération du résumé en cours...</span>
                      </div>
                    </div>
                  )}

                  {summary && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <BookOpen className="mr-2 text-[#133E87]" size={20} />
                        Résumé
                      </h3>
                      <div className="max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Course information - Only show after transcription is complete */}
                  {completed && (
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="module" className="text-gray-900">Module</Label>
                        <Select value={selectedModule} onValueChange={setSelectedModule}>
                          <SelectTrigger id="module" className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]">
                            <SelectValue placeholder="Sélectionner un module" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 rounded-lg">
                            {modules.map((module) => (
                              <SelectItem 
                                key={module.id} 
                                value={module.id.toString()} 
                                className="rounded-lg hover:bg-[#133E87]/10"
                              >
                                {module.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="course" className="text-gray-900">Nom du cours</Label>
                        <Input
                          id="course"
                          value={courseName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseName(e.target.value)}
                          placeholder="Ex: Introduction au machine learning"
                          className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          {!completed ? (
            <Button
              disabled={!uploadedFile || processing}
              onClick={processFile}
              className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {processing ? "Traitement en cours..." : "Traiter l'audio"}
            </Button>
          ) : (
            <Button
              disabled={!selectedModule || !courseName}
              onClick={saveTranscription}
              className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
            >
              Enregistrer
            </Button>
          )}
        </CardFooter>
      </Card>

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
                      <span>Module</span>
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
                {recentUploads.map((course, index) => {
                  console.log('Rendering course:', course); // Debug log for each course
                  console.log('Course module:', course.module); // Debug log for module
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-[#133E87]/5 transition-colors"
                    >
                      <td className="py-3 pl-2 text-gray-900 rounded-bl-lg">{course.name}</td>
                      <td className="py-3 text-gray-900">
                        <Badge variant="outline" className="border-[#133E87] text-[#133E87] rounded-lg">
                          {typeof course.module === 'object' ? course.module.abreviation : course.module}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(course.time_inserted).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 text-gray-900">
                        <p className="text-sm line-clamp-1">
                          {course.transcription ? course.transcription.substring(0, 50) + "..." : "Aucune transcription"}
                        </p>
                      </td>
                      <td className="py-3 pr-2 rounded-br-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsModalOpen(true);
                          }}
                          className="text-[#133E87] hover:bg-[#133E87]/10 rounded-lg"
                        >
                          <List size={16} className="mr-2" />
                          Voir détails
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
                    <Badge variant="outline" className="border-[#133E87] text-[#133E87]">
                      {typeof selectedCourse.module === 'object' ? selectedCourse.module.abreviation : selectedCourse.module}
                    </Badge>
                    {typeof selectedCourse.module === 'object' && (
                      <span className="text-sm text-gray-900">{selectedCourse.module.name}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date d'ajout</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedCourse.time_inserted).toLocaleDateString('fr-FR')}
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
    </ProfessorLayout>
  );
}

export default withRoleGuard(ProfesseurDashboard, ["PROFESSEUR"]); 