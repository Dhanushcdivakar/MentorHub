import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { BookOpen, Plus, Trash2, Loader2, Save, FileUp, Image, Clipboard, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getResourcesApi, createResourceApi, deleteResourceApi, getCategoriesApi } from "@/api/books.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminBooks() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // New fields matching the backend schema
  const [type, setType] = useState("PDF");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [language, setLanguage] = useState("English");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // Queries
  const { data: resResponse, isLoading: isResLoading, isError } = useQuery({
    queryKey: ["resources"],
    queryFn: () => getResourcesApi(),
  });

  const { data: catResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const books = resResponse?.data || [];
  const categories = catResponse?.data || [];

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: createResourceApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Resource uploaded successfully!");
        setTitle("");
        setDescription("");
        setCategory("");
        setType("PDF");
        setDifficulty("BEGINNER");
        setLanguage("English");
        setAuthor("");
        setTags("");
        setExternalUrl("");
        setEstimatedReadTime(0);
        setThumbnailFile(null);
        setResourceFile(null);
        queryClient.invalidateQueries({ queryKey: ["resources"] });
      } else {
        toast.error(res.message || "Upload failed");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Upload failed");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResourceApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Resource deleted");
        queryClient.invalidateQueries({ queryKey: ["resources"] });
      } else {
        toast.error(res.message || "Failed to delete resource");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete resource");
    },
  });

  const handleUpload = (e) => {
    e.preventDefault();

    // Frontend validations to match Joi schema rules
    if (!title.trim()) {
      toast.error("Resource title is required");
      return;
    }
    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }
    if (title.trim().length > 200) {
      toast.error("Title cannot exceed 200 characters");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!type) {
      toast.error("Please select a resource type");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters long");
      return;
    }
    if (type !== "EXTERNAL_LINK" && !resourceFile) {
      toast.error("Resource document file is required");
      return;
    }
    if (type === "EXTERNAL_LINK" && !externalUrl.trim()) {
      toast.error("External URL is required for External Link resource type");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("type", type);
    formData.append("difficulty", difficulty);
    formData.append("language", language.trim());

    if (author.trim()) {
      formData.append("author", author.trim());
    }
    if (externalUrl.trim()) {
      formData.append("externalUrl", externalUrl.trim());
    }

    formData.append("estimatedReadTime", Number(estimatedReadTime) || 0);

    if (tags.trim()) {
      formData.append("tags", tags.trim());
    }

    if (resourceFile) {
      formData.append("resourceFile", resourceFile);
    }
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header welcome */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Manage Catalog Resources</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload new premium study guides and delete catalog items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload form */}
        <Card className="lg:col-span-1 border border-border/80 shadow-sm bg-card rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
              <FileUp className="h-4.5 w-4.5 text-primary" />
              Upload Book/PDF
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="title">
                  Resource Title *
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Clean Code Basics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/10 border-border/80 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="category">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary capitalize"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="type">
                    Resource Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="BOOK">Book</option>
                    <option value="PDF">PDF</option>
                    <option value="ARTICLE">Article</option>

                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="EXTERNAL_LINK">External Link</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="difficulty">
                    Difficulty Level *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="estimatedReadTime">
                    Read Time (mins)
                  </label>
                  <Input
                    id="estimatedReadTime"
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={estimatedReadTime}
                    onChange={(e) => setEstimatedReadTime(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="language">
                    Language
                  </label>
                  <Input
                    id="language"
                    placeholder="e.g. English"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="author">
                    Author / Creator
                  </label>
                  <Input
                    id="author"
                    placeholder="e.g. Robert C. Martin"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="tags">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  placeholder="e.g. programming, react, clean-code"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-muted/10 border-border/80 rounded-xl"
                  disabled={isSaving}
                />
              </div>

              {type === "EXTERNAL_LINK" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="externalUrl">
                    External URL *
                  </label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://example.com/resource"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl focus:border-primary"
                    disabled={isSaving}
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="description">
                    Short Description *
                  </label>
                  <span className="text-[10px] text-muted-foreground">Min 10 characters</span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Summarize the core topics covered in this study resource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/10 border-border/80 rounded-xl min-h-[90px] text-sm p-3 focus-visible:ring-1 focus-visible:ring-primary leading-relaxed"
                  disabled={isSaving}
                  required
                />
              </div>

              {/* PDF/Resource File Uploader */}
              {type !== "EXTERNAL_LINK" && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Resource Document (.pdf, .doc) *</span>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-border/80 rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-2 text-center px-4">
                        <Clipboard className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">
                          {resourceFile ? (
                            <span className="font-semibold text-primary truncate max-w-[200px] inline-block">
                              {resourceFile.name}
                            </span>
                          ) : (
                            "Click to select a document file"
                          )}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                        className="hidden"
                        disabled={isSaving}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Thumbnail Image Uploader */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Thumbnail Cover Image</span>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-border/80 rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all">
                    <div className="flex flex-col items-center justify-center pt-3 pb-2 text-center px-4">
                      <Image className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">
                        {thumbnailFile ? (
                          <span className="font-semibold text-primary truncate max-w-[200px] inline-block">
                            {thumbnailFile.name}
                          </span>
                        ) : (
                          "Click to select a cover image"
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={isSaving}
                    />
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold text-primary-foreground transition-all flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Upload Resource
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List resources */}
        <Card className="lg:col-span-2 border border-border/80 shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 pb-2 border-b border-border/40">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-primary" />
                Active Library Resources
              </h3>
            </div>

            {isResLoading ? (
              <div className="p-6 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : isError ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-sm font-semibold">Failed to fetch library inventory</p>
              </div>
            ) : books.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      {isAdmin && <TableHead className="pr-6 text-right">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell className="font-medium pl-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-foreground">{book.title}</p>
                            <p className="text-[10px] text-muted-foreground leading-normal truncate max-w-[200px]">
                              {book.filename || "Uploaded book file"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-xs text-muted-foreground">{typeof book.category === "object" ? book.category?.name : (book.category || "General")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{book.averageRating || "N/A"}</TableCell>
                        {isAdmin && (
                          <TableCell className="pr-6 text-right py-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(book._id)}
                              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
                <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No resources uploaded yet</p>
                <p className="text-xs text-muted-foreground">Add resources using the form on the left</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
