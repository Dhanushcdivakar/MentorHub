import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, BookOpen, Download, Bookmark, BookmarkCheck, Star, AlertCircle, Plus, TrendingUp, ThumbsUp, Eye, Award, MessageSquare, Loader2, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  getResourcesApi,
  getBookmarksApi,
  addBookmarkApi,
  removeBookmarkApi,
  getCategoriesApi,
  getResourceByIdApi,
  getTrendingBooksApi,
  getTopRatedBooksApi,
  getMostViewedBooksApi,
  getMostDownloadedBooksApi,
  getResourceReviewsApi,
  addResourceReviewApi,
  deleteResourceReviewApi
} from "@/api/books.api";
import api from "@/api/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Books() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.auth.accessToken);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [activeTab, setActiveTab] = useState("catalog");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const isMentorOrAdmin = user?.role === "mentor" || user?.role === "admin";

  const handleDownload = async (e, bookId, originalName) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading("Downloading resource...");
    try {
      const response = await api.get(`/api/books/resources/${bookId}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
      const localUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = localUrl;
      link.setAttribute("download", originalName || "resource.pdf");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(localUrl);

      toast.success("Download complete!", { id: toastId });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file.", { id: toastId });
    }
  };

  // Queries
  const { data: resResponse, isLoading: isResLoading, isError } = useQuery({
    queryKey: ["resources"],
    queryFn: () => getResourcesApi(),
  });

  const { data: catResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: bookmarkResponse } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarksApi,
    enabled: !!user,
  });

  // Leaderboard Queries
  const { data: trendingResponse } = useQuery({
    queryKey: ["trendingBooks"],
    queryFn: getTrendingBooksApi,
    enabled: activeTab === "leaderboards",
  });

  const { data: topRatedResponse } = useQuery({
    queryKey: ["topRatedBooks"],
    queryFn: getTopRatedBooksApi,
    enabled: activeTab === "leaderboards",
  });

  const { data: mostViewedResponse } = useQuery({
    queryKey: ["mostViewedBooks"],
    queryFn: getMostViewedBooksApi,
    enabled: activeTab === "leaderboards",
  });

  const { data: mostDownloadedResponse } = useQuery({
    queryKey: ["mostDownloadedBooks"],
    queryFn: getMostDownloadedBooksApi,
    enabled: activeTab === "leaderboards",
  });

  // Resource details and reviews queries
  const { data: detailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["bookDetails", selectedBookId],
    queryFn: () => getResourceByIdApi(selectedBookId),
    enabled: !!selectedBookId,
  });

  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["bookReviews", selectedBookId],
    queryFn: () => getResourceReviewsApi(selectedBookId),
    enabled: !!selectedBookId,
  });

  const selectedBook = detailResponse?.data;
  const bookReviews = reviewsResponse?.data || [];

  // Review Mutations
  const addReviewMutation = useMutation({
    mutationFn: addResourceReviewApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Review submitted!");
        setNewReviewComment("");
        setNewReviewRating(5);
        queryClient.invalidateQueries({ queryKey: ["bookReviews", selectedBookId] });
        queryClient.invalidateQueries({ queryKey: ["resources"] });
        queryClient.invalidateQueries({ queryKey: ["bookDetails", selectedBookId] });
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
    onSettled: () => {
      setIsSubmittingReview(false);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteResourceReviewApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Review deleted");
        queryClient.invalidateQueries({ queryKey: ["bookReviews", selectedBookId] });
        queryClient.invalidateQueries({ queryKey: ["resources"] });
        queryClient.invalidateQueries({ queryKey: ["bookDetails", selectedBookId] });
      } else {
        toast.error(res.message || "Failed to delete review");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete review");
    },
  });

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      toast.error("Feedback comment is required");
      return;
    }
    setIsSubmittingReview(true);
    addReviewMutation.mutate({
      resourceId: selectedBookId,
      rating: newReviewRating,
      comment: newReviewComment,
    });
  };

  const handleDeleteReview = (id) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      deleteReviewMutation.mutate(id);
    }
  };


  const books = resResponse?.data || [];
  console.log("BOOKS DEBUG:", { resResponse, books });
  const categories = catResponse?.data || [];
  const bookmarkedIds = useMemo(() => {
    const list = bookmarkResponse?.data || [];
    return new Set(
      list.map((b) => {
        if (b.resourceId && typeof b.resourceId === "object") {
          return b.resourceId._id;
        }
        return b.resourceId || b._id;
      })
    );
  }, [bookmarkResponse]);

  // Mutations
  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ id, isBookmarked }) => {
      return isBookmarked ? removeBookmarkApi(id) : addBookmarkApi(id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        toast.success(res.message || "Bookmarks updated");
      } else {
        toast.error(res.message || "Failed to update bookmark");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to bookmark");
    },
  });

  // Client side search, category, and bookmark filter
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCat === "all" ||
        b.category === selectedCat ||
        b.categoryId === selectedCat ||
        (b.category && (b.category.name === selectedCat || b.category._id === selectedCat));

      const matchesBookmark = !showBookmarkedOnly || bookmarkedIds.has(b._id);

      return matchesSearch && matchesCat && matchesBookmark;
    });
  }, [books, search, selectedCat, showBookmarkedOnly, bookmarkedIds]);

  // Reset page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [search, selectedCat, showBookmarkedOnly]);

  // Calculate paginated books slice
  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  const handleBookmarkToggle = (id) => {
    const isBookmarked = bookmarkedIds.has(id);
    toggleBookmarkMutation.mutate({ id, isBookmarked });
  };

  const isLoading = isResLoading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Books & Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Access, download, and bookmark premium study resources.
          </p>
        </div>

        {isMentorOrAdmin && (
          <Button asChild className="rounded-xl font-semibold gap-1.5 shrink-0 self-start sm:self-center">
            {user?.role === "admin" ? (
              <Link to="/admin/books">
                <Plus className="h-4.5 w-4.5" />
                Upload Resource
              </Link>
            ) : (
              <Link to="/mentor/books">
                <Plus className="h-4.5 w-4.5" />
                Upload Resource
              </Link>
            )}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-3 mb-8">
        <Button
          variant={activeTab === "catalog" ? "default" : "ghost"}
          onClick={() => setActiveTab("catalog")}
          className="rounded-xl text-sm font-semibold py-1.5 px-4 h-9"
        >
          <BookOpen className="h-4 w-4 mr-1.5" />
          Resource Catalog
        </Button>
        <Button
          variant={activeTab === "leaderboards" ? "default" : "ghost"}
          onClick={() => setActiveTab("leaderboards")}
          className="rounded-xl text-sm font-semibold py-1.5 px-4 h-9"
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Trending & Analytics
        </Button>
      </div>

      {activeTab === "catalog" ? (
        <>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-card p-4 rounded-2xl border border-border/40 shadow-sm items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by resource title, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/20 border-border/80 rounded-xl py-5 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Category Selector */}
        <div className="md:col-span-3">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary capitalize"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bookmarks Toggle */}
        <div className="md:col-span-3 flex items-center justify-end">
          <Button
            type="button"
            variant={showBookmarkedOnly ? "default" : "outline"}
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className="w-full h-10 rounded-xl font-semibold text-xs gap-1.5 border-border/80"
          >
            <Bookmark className={`h-4 w-4 ${showBookmarkedOnly ? "fill-current" : ""}`} />
            {showBookmarkedOnly ? "Showing Bookmarked" : "Show Bookmarked Only"}
          </Button>
        </div>
      </div>

      {/* Skeletons grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border/60 shadow-sm overflow-hidden h-80 flex flex-col justify-between">
              <CardContent className="p-5 space-y-3 flex-1">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl text-center bg-card">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold mb-1">Failed to load resources</h3>
          <p className="text-sm text-muted-foreground mb-4">
            An error occurred while communicating with the books microservice.
          </p>
        </div>
      )}

      {/* Grid Layout */}
      {!isLoading && !isError && (
        <div>
          {paginatedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedBooks.map((book) => {
                  const isBookmarked = bookmarkedIds.has(book._id);
                  return (
                    <Card key={book._id} className="border border-border/85 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card overflow-hidden flex flex-col h-full relative group">
                      {/* Thumbnail fallback */}
                      <div className="h-40 bg-muted/40 flex items-center justify-center text-muted-foreground/80 border-b border-border/20 shrink-0 relative">
                        {book.thumbnailUrl || book.thumbnail?.url ? (
                          <img
                            src={book.thumbnailUrl || book.thumbnail?.url}
                            alt={book.title}
                            className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedBookId(book._id)}
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-muted-foreground/45 group-hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => setSelectedBookId(book._id)} />
                        )}

                        {/* Bookmark button floating */}
                        <button
                          type="button"
                          onClick={() => handleBookmarkToggle(book._id)}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border shadow-sm transition-all focus:outline-none ${
                            isBookmarked
                              ? "bg-primary border-primary text-primary-foreground scale-105"
                              : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>

                      <CardContent className="p-5 flex flex-col flex-grow gap-3 justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              {typeof book.category === "object" ? book.category?.name : (book.category || "General")}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 truncate hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedBookId(book._id)}>
                            {book.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {book.description || "No description provided."}
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20 pt-2.5 font-medium">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span>{book.averageRating?.toFixed(1) || "0.0"} ({book.totalRatings || 0})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{book.totalViews || 0} views</span>
                              <span>•</span>
                              <span>{book.totalDownloads || 0} downloads</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="w-full rounded-xl font-semibold gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 py-4"
                            onClick={(e) => handleDownload(e, book._id, book.resourceFile?.originalName || `${book.title.replace(/\s+/g, "_")}.pdf`)}
                          >
                            <Download className="h-4 w-4" />
                            Secure Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination controls footer */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6">
                  {/* Pagination Info */}
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(startIndex + pageSize, totalItems)}
                    </span> of{" "}
                    <span className="font-semibold text-foreground">{totalItems}</span> resources
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {/* Page Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl border border-border/80"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`h-8.5 w-8.5 rounded-xl font-semibold border ${
                            currentPage === page
                              ? ""
                              : "border-border/80 text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl border border-border/80"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Page Size Selector */}
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8.5 text-xs font-semibold bg-background border border-border/80 rounded-xl px-2.5 outline-none text-muted-foreground focus:border-primary/50 transition-colors"
                    >
                      <option value={8}>8 per page</option>
                      <option value={16}>16 per page</option>
                      <option value={24}>24 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-2 border border-dashed border-border/80 rounded-2xl bg-card">
              <BookOpen className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">No resources match filters</p>
              <p className="text-xs text-muted-foreground">Adjust search query or category filters.</p>
            </div>
          )}
        </div>
      )}
      </>
      ) : (
        /* Leaderboards Tab content */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trending Books */}
          <Card className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/40">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                Trending Guides
              </h3>
              <div className="space-y-4">
                {trendingResponse?.data?.length > 0 ? (
                  trendingResponse.data.slice(0, 5).map((book, idx) => (
                    <div key={book._id} className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 p-2 rounded-xl" onClick={() => setSelectedBookId(book._id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{book.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{typeof book.category === "object" ? book.category?.name : (book.category || "General")}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Hot
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No trending data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Rated Books */}
          <Card className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/40">
                <ThumbsUp className="h-4.5 w-4.5 text-yellow-500" />
                Top Rated Resources
              </h3>
              <div className="space-y-4">
                {topRatedResponse?.data?.length > 0 ? (
                  topRatedResponse.data.slice(0, 5).map((book, idx) => (
                    <div key={book._id} className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 p-2 rounded-xl" onClick={() => setSelectedBookId(book._id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{book.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{typeof book.category === "object" ? book.category?.name : (book.category || "General")}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        {book.averageRating || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No ratings yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Most Viewed Books */}
          <Card className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/40">
                <Eye className="h-4.5 w-4.5 text-indigo-500" />
                Most Viewed Guides
              </h3>
              <div className="space-y-4">
                {mostViewedResponse?.data?.length > 0 ? (
                  mostViewedResponse.data.slice(0, 5).map((book, idx) => (
                    <div key={book._id} className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 p-2 rounded-xl" onClick={() => setSelectedBookId(book._id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{book.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{typeof book.category === "object" ? book.category?.name : (book.category || "General")}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        {book.totalViews || 0} views
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No view data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Most Downloaded Books */}
          <Card className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/40">
                <Download className="h-4.5 w-4.5 text-emerald-500" />
                Most Downloaded Guides
              </h3>
              <div className="space-y-4">
                {mostDownloadedResponse?.data?.length > 0 ? (
                  mostDownloadedResponse.data.slice(0, 5).map((book, idx) => (
                    <div key={book._id} className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 p-2 rounded-xl" onClick={() => setSelectedBookId(book._id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">{book.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{typeof book.category === "object" ? book.category?.name : (book.category || "General")}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        {book.totalDownloads || 0} downloads
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No downloads yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Book Details & Reviews Dialog */}
      <Dialog open={!!selectedBookId} onOpenChange={(open) => !open && setSelectedBookId(null)}>
        <DialogContent className="rounded-2xl max-w-2xl p-6 bg-card border border-border shadow-xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Resource details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Read comprehensive study notes, reviews, and community ratings.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-3/4 rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            selectedBook && (
              <div className="space-y-6 py-2">
                {/* Book header */}
                <div className="flex gap-4 items-start">
                  <div className="h-24 w-20 bg-muted/40 flex items-center justify-center border border-border rounded-xl shrink-0 overflow-hidden">
                    {selectedBook.thumbnailUrl || selectedBook.thumbnail?.url ? (
                      <img src={selectedBook.thumbnailUrl || selectedBook.thumbnail?.url} alt={selectedBook.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-8 w-8 text-muted-foreground/45" />
                    )}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {typeof selectedBook.category === "object" ? selectedBook.category?.name : (selectedBook.category || "General")}
                      </span>
                      {selectedBook.difficulty && (
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {selectedBook.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-foreground leading-snug">{selectedBook.title}</h3>
                    {selectedBook.author && (
                      <p className="text-xs text-muted-foreground font-medium">By {selectedBook.author}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">Description</span>
                  <p className="text-foreground leading-relaxed bg-muted/5 p-3 rounded-lg border border-border/30">
                    {selectedBook.description || "No description provided."}
                  </p>
                </div>

                {/* Meta properties */}
                <div className="grid grid-cols-3 gap-4 bg-muted/10 p-3.5 rounded-xl border border-border/40 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block mb-0.5">EST. Read Time</span>
                    <span className="font-bold text-foreground block">{selectedBook.estimatedReadTime || 0} Minutes</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block mb-0.5">Rating Score</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      {selectedBook.averageRating > 0 ? `${selectedBook.averageRating.toFixed(1)} / 5` : "No ratings"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[9px] tracking-wider block mb-0.5">File Format</span>
                    <span className="font-bold text-foreground block capitalize">{selectedBook.type || "PDF"}</span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl font-semibold gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 py-5 text-sm"
                  onClick={(e) => handleDownload(e, selectedBook._id, selectedBook.resourceFile?.originalName || `${selectedBook.title.replace(/\s+/g, "_")}.pdf`)}
                >
                  <Download className="h-4.5 w-4.5" />
                  Download study resource
                </Button>

                {/* Reviews section */}
                <div className="border-t border-border/40 pt-4 space-y-4">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-primary" />
                    Community Reviews ({bookReviews.length})
                  </h4>

                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {isReviewsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : bookReviews.length > 0 ? (
                      bookReviews.map((rev) => (
                        <div key={rev._id} className="p-3 bg-muted/5 rounded-xl border border-border/30 relative text-xs">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="font-bold text-foreground">{rev.userName || "User"}</span>
                            <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {rev.rating}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-normal">{rev.comment}</p>
                          {rev.userId === user?.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev._id)}
                              className="absolute top-3 right-4 p-1 text-muted-foreground hover:text-destructive text-[10px] font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No reviews written for this study guide yet.</p>
                    )}
                  </div>

                  {/* Add review form */}
                  {user && !bookReviews.some((r) => r.userId === user.id) && (
                    <form onSubmit={handleAddReview} className="p-4 bg-muted/10 rounded-xl border border-border/40 space-y-4">
                      <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">Write a review</h5>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground font-semibold">Your Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} type="button" onClick={() => setNewReviewRating(s)} className="focus:outline-none">
                              <Star className={`h-4.5 w-4.5 ${s <= newReviewRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Textarea
                          placeholder="What did you think of this resource? Was it helpful? Is it clean and easy to follow?"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="bg-background border-border/80 rounded-lg min-h-[70px] text-xs p-3 focus-visible:ring-1 focus-visible:ring-primary leading-normal"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full text-xs font-semibold rounded-lg h-9"
                      >
                        {isSubmittingReview ? "Submitting review..." : "Submit feedback"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedBookId(null)} className="rounded-xl w-full">
              Close Detail Panel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
