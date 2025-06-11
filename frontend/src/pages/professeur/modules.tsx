import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Pencil, Trash2, Info, BookOpen, Tag } from "lucide-react";
import { useToast } from "../../components/ui/toast-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfessorLayout from '@/components/layout/ProfessorLayout';

interface Module {
  id: number;
  name: string;
  abreviation: string;
  description: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abreviation: z.string().min(1, "Abbreviation is required").max(10, "Abbreviation must be 10 characters or less"),
  description: z.string().optional(),
});

export default function ModulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      abreviation: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/professeur/modules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModules(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive",
      });
    }
  };

  const handleCreate = () => {
    setSelectedModule(null);
    form.reset();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    form.reset(module);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/professeur/modules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("token");
      if (selectedModule) {
        // Update existing module
        await axios.put(
          `http://localhost:8000/professeur/modules/${selectedModule.id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast({
          title: "Success",
          description: "Module updated successfully",
        });
      } else {
        // Create new module
        await axios.post("http://localhost:8000/professeur/modules", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast({
          title: "Success",
          description: "Module created successfully",
        });
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      form.reset();
      fetchModules();
    } catch (error) {
      console.error("Error saving module:", error);
      toast({
        title: "Error",
        description: "Failed to save module",
        variant: "destructive",
      });
    }
  };

  // Filter modules based on search
  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchText.toLowerCase()) ||
    module.abreviation.toLowerCase().includes(searchText.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <ProfessorLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
            <BookOpen className="ml-2 text-[#133E87]" size={24} />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleCreate}
                className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un Module
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  {selectedModule ? 'Modifier le Module' : 'Créer un Module'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Nom</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="abreviation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Abréviation</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            maxLength={10} 
                            className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
                    >
                      {selectedModule ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative w-80 mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher des modules..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
          />
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map((module) => (
            <Card 
              key={module.id} 
              className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-gray-200 rounded-lg bg-white"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#133E87]/10 flex items-center justify-center">
                    <span className="text-[#133E87] font-bold text-lg">
                      {module.abreviation}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {module.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="mt-1 border-[#133E87] text-[#133E87] rounded-lg"
                    >
                      <Tag size={12} className="mr-1" />
                      {module.abreviation}
                    </Badge>
                  </div>
                </div>
                
                {module.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {module.description}
                  </p>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedModule(module)}
                    className="text-[#133E87] hover:bg-[#133E87]/10 rounded-lg"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(module)}
                    className="text-[#133E87] hover:bg-[#133E87]/10 rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(module.id.toString())}
                    className="text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#133E87]/10 rounded-full">
                <BookOpen size={48} className="text-[#133E87]" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchText ? 'Aucun module trouvé' : 'Aucun module disponible'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchText 
                ? 'Essayez de modifier votre recherche' 
                : 'Commencez par créer votre premier module'
              }
            </p>
            {!searchText && (
              <Button 
                onClick={handleCreate}
                className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un Module
              </Button>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Modifier le Module</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Nom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abreviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Abréviation</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          maxLength={10} 
                          className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Description</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
                  >
                    Mettre à jour
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Module Details Dialog */}
        <Dialog open={!!selectedModule && !isEditDialogOpen} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Détails du Module</DialogTitle>
            </DialogHeader>
            {selectedModule && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-[#133E87]/5 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-[#133E87]/10 flex items-center justify-center">
                    <span className="text-[#133E87] font-bold text-xl">
                      {selectedModule.abreviation}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">
                      {selectedModule.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="mt-1 border-[#133E87] text-[#133E87] rounded-lg"
                    >
                      <Tag size={12} className="mr-1" />
                      {selectedModule.abreviation}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-medium mb-2 text-gray-900 flex items-center">
                    <Info className="mr-2 text-[#133E87]" size={16} />
                    Description
                  </h4>
                  <p className="text-gray-600">
                    {selectedModule.description || "Aucune description fournie"}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedModule(null)}
                    className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Fermer
                  </Button>
                  <Button 
                    onClick={() => handleEdit(selectedModule)}
                    className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProfessorLayout>
  );
}