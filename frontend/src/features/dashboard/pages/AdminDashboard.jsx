import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, GraduationCap, Plus, Trash2, Loader2, Settings } from "lucide-react";
import toast from "react-hot-toast";

import { getCategoriesApi, createCategoryApi, deleteCategoryApi } from "@/api/books.api";
import { getUserStatsApi } from "@/api/user.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: catResponse, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStatsApi,
  });

  const categories = catResponse?.data || [];
  const userStats = statsResponse?.data || { totalStudents: 0, activeMentors: 0 };

  // Mutations
  const addMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Category added successfully!");
        setNewCatName("");
        setNewCatDesc("");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(res.message || "Failed to add category");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add category");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Category deleted");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setIsSubmitting(true);
    addMutation.mutate({
      name: newCatName,
      description: newCatDesc,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const stats = [
    { label: "Total Students", value: userStats.totalStudents, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Active Mentors", value: userStats.activeMentors, icon: GraduationCap, color: "text-violet-500 bg-violet-500/10" },
    { label: "Active Categories", value: categories.length, icon: Settings, color: "text-indigo-500 bg-indigo-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header welcome */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Admin Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">Review system analytics and manage taxonomy classifications.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border border-border/80 shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Categories CRUD Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of categories */}
        <Card className="lg:col-span-2 border border-border/80 shadow-sm bg-card rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-primary" />
              Taxonomy Categories
            </h3>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : categories.length > 0 ? (
              <div className="divide-y divide-border/20">
                {categories.map((cat) => (
                  <div key={cat._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground leading-normal">{cat.description || "No description provided."}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(cat._id)}
                      className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <Settings className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No categories defined</p>
                <p className="text-xs text-muted-foreground">Add a taxonomy category to organize books.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add category form */}
        <Card className="border border-border/80 shadow-sm bg-card rounded-2xl h-max">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              Create Category
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="catName">
                  Category Name
                </label>
                <Input
                  id="catName"
                  placeholder="e.g. Frontend Development"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-muted/10 border-border/80 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="catDesc">
                  Description
                </label>
                <Input
                  id="catDesc"
                  placeholder="React, CSS, and styling concepts..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="bg-muted/10 border-border/80 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold text-primary-foreground transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
