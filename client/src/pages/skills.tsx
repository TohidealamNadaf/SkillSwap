import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const skillFormSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  type: z.enum(["teach", "learn"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  description: z.string().optional(),
});

type SkillFormData = z.infer<typeof skillFormSchema>;

interface Skill {
  id: number;
  userId: number;
  name: string;
  type: "teach" | "learn";
  level: "beginner" | "intermediate" | "advanced";
  description?: string;
  createdAt: string;
}

export default function Skills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      type: "teach",
      level: "beginner",
      description: "",
    },
  });

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["/api/skills", { userId: user?.id }],
    enabled: !!user?.id,
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: SkillFormData) => {
      const response = await apiRequest("POST", "/api/skills", {
        ...data,
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setIsDialogOpen(false);
      setEditingSkill(null);
      form.reset();
      toast({
        title: "Success",
        description: "Skill added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async (data: SkillFormData & { id: number }) => {
      const response = await apiRequest("PUT", `/api/skills/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setIsDialogOpen(false);
      setEditingSkill(null);
      form.reset();
      toast({
        title: "Success",
        description: "Skill updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Success",
        description: "Skill deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SkillFormData) => {
    if (editingSkill) {
      updateSkillMutation.mutate({ ...data, id: editingSkill.id });
    } else {
      createSkillMutation.mutate(data);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    form.reset({
      name: skill.name,
      type: skill.type,
      level: skill.level,
      description: skill.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (skillId: number) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      deleteSkillMutation.mutate(skillId);
    }
  };

  const teachSkills = skills.filter((skill: Skill) => skill.type === "teach");
  const learnSkills = skills.filter((skill: Skill) => skill.type === "learn");

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Skills</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage the skills you can teach and want to learn
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSkill(null); form.reset(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
              <DialogDescription>
                {editingSkill ? "Update your skill details" : "Add a skill you can teach or want to learn"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JavaScript Programming" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="teach">I can teach this</SelectItem>
                          <SelectItem value="learn">I want to learn this</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your experience or what you hope to learn..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                  >
                    {editingSkill ? "Update" : "Add"} Skill
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Skills I Can Teach */}
        <div>
          <div className="flex items-center mb-4">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Skills I Can Teach ({teachSkills.length})
            </h2>
          </div>
          <div className="space-y-4">
            {teachSkills.map((skill: Skill) => (
              <Card key={skill.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(skill)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {skill.description && (
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{skill.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {teachSkills.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <GraduationCap className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    No teaching skills added yet.<br />
                    Add skills you can teach to help others learn!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div>
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 mr-2 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Skills I Want to Learn ({learnSkills.length})
            </h2>
          </div>
          <div className="space-y-4">
            {learnSkills.map((skill: Skill) => (
              <Card key={skill.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(skill)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {skill.description && (
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{skill.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {learnSkills.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    No learning skills added yet.<br />
                    Add skills you want to learn to find teachers!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}