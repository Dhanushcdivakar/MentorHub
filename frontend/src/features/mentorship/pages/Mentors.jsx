import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, GraduationCap, AlertCircle, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getMentorsApi } from "@/api/user.api";
import { getStudentSessionsApi } from "@/api/mentorship.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Mentors() {
  const { user } = useSelector((state) => state.user);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [minExp, setMinExp] = useState(0);
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("filter");
  const isStudent = user?.role === "student";

  // Fetch mentors using React Query
  const { data: response, isLoading: isMentorsLoading, isError, error } = useQuery({
    queryKey: ["mentors"],
    queryFn: getMentorsApi,
  });

  // Fetch student sessions to know which mentors they worked with
  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["studentSessions"],
    queryFn: getStudentSessionsApi,
  });

  // Extract all unique mentor IDs from completed sessions
  const guidedMentorIds = useMemo(() => {
    const list = sessionsResponse?.data || [];
    const completed = list.filter((s) => s.status === "completed");
    return new Set(completed.map((s) => s.mentorId));
  }, [sessionsResponse?.data]);

  // Extract all unique skills across all mentors for filters
  const allSkills = useMemo(() => {
    const skills = new Set();
    const list = response?.data || [];
    list.forEach((m) => {
      m.skills?.forEach((s) => skills.add(s.trim()));
    });
    return ["all", ...Array.from(skills)];
  }, [response?.data]);

  // Client-side filtering for search & qualifications
  const filteredMentors = useMemo(() => {
    const list = response?.data || [];
    return list.filter((m) => {
      // Filter by guided mentors only if filterType === "guided"
      if (filterType === "guided" && !guidedMentorIds.has(m._id) && !guidedMentorIds.has(m.authId)) {
        return false;
      }

      const matchesSearch =
         m.name.toLowerCase().includes(search.toLowerCase()) ||
         m.bio?.toLowerCase().includes(search.toLowerCase()) ||
         m.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesSkill =
        selectedSkill === "all" ||
        m.skills?.some((s) => s.trim().toLowerCase() === selectedSkill.toLowerCase());

      const matchesExp = (m.experience || 0) >= minExp;

      return matchesSearch && matchesSkill && matchesExp;
    });
  }, [response?.data, search, selectedSkill, minExp, filterType, guidedMentorIds]);

  const isLoading = isMentorsLoading || isSessionsLoading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 text-center sm:text-left">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {filterType === "guided" ? "My Mentors" : "Find a Mentor"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {filterType === "guided"
              ? "Mentors who have guided you and whose sessions you have completed."
              : "Explore experienced engineering leaders, schedule 1-on-1 sessions, and accelerate your development path."}
          </p>
        </div>
        {filterType === "guided" && (
          <Button asChild variant="outline" className="rounded-xl self-center sm:self-end">
            <Link to="/mentors">View All Mentors</Link>
          </Button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, bio, or skills..."
            className="pl-9 bg-muted/20 border-border/80 rounded-xl py-5 focus-visible:ring-1 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Skill Filter */}
        <div>
          <select
            className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary capitalize"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="all">All Skills</option>
            {allSkills
              .filter((s) => s !== "all")
              .map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
          </select>
        </div>

        {/* Experience Filter */}
        <div>
          <select
            className="w-full h-10 px-3 rounded-xl border border-border/80 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            value={minExp}
            onChange={(e) => setMinExp(Number(e.target.value))}
          >
            <option value={0}>Any Experience</option>
            <option value={2}>2+ Years</option>
            <option value={5}>5+ Years</option>
            <option value={8}>8+ Years</option>
            <option value={10}>10+ Years</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="border border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl text-center bg-card">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold mb-1">Failed to load mentors</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "An error occurred while fetching the mentor registry."}
          </p>
          <Button onClick={() => window.location.reload()} size="sm">
            Try Again
          </Button>
        </div>
      )}

      {/* Grid List */}
      {!isLoading && !isError && (
        <AnimatePresence>
          {filteredMentors.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredMentors.map((mentor) => (
                <motion.div
                  key={mentor._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 rounded-2xl flex flex-col h-full bg-card">
                    <CardContent className="p-6 flex flex-col h-full gap-4">
                      {/* Mentor Profile Header */}
                      <div className="flex items-start gap-4">
                        <div className="relative rounded-full overflow-hidden bg-muted h-12 w-12 border border-border/60 shrink-0">
                          {mentor.profilePicture ? (
                            <img
                              src={mentor.profilePicture}
                              alt={mentor.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-2 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {mentor.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{mentor.experience || 0} years experience</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {mentor.bio || "No biography provided yet."}
                      </p>

                      {/* Skills Badges */}
                      {mentor.skills && mentor.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-muted/60 text-muted-foreground capitalize font-medium rounded-lg"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* CTA Booking Link */}
                      {isStudent && (
                        <Button asChild className="w-full rounded-xl mt-2 font-semibold">
                          <Link to={`/student/book/${mentor._id}`} className="gap-2">
                            Book 1-on-1 Session
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-16 border border-dashed border-border/80 rounded-2xl text-center bg-card"
            >
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1">
                {filterType === "guided" ? "No completed mentorship sessions yet" : "No mentors found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {filterType === "guided"
                  ? "You haven't completed any sessions with a mentor yet. Browse the catalog to schedule a session!"
                  : `We couldn't find any mentors matching "${search}". Try adjusting your search query or filters.`}
              </p>
              {filterType === "guided" && (
                <Button asChild size="sm" className="rounded-xl">
                  <Link to="/mentors">Browse All Mentors</Link>
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
