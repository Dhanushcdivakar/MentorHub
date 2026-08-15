import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, XCircle, Users, ArrowRight, Video, FileText, Compass, BookOpen } from "lucide-react";
import { format } from "date-fns";

import { getStudentDashboardApi, getStudentSessionsApi } from "@/api/mentorship.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const navigate = useNavigate();
  // Query dashboard counts
  const { data: dashResponse, isLoading: isDashLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: getStudentDashboardApi,
  });

  // Query actual student sessions
  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["studentSessions"],
    queryFn: getStudentSessionsApi,
  });

  const stats = dashResponse?.data || {
    upcomingSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    mentorsWorkedWith: 0,
  };

  const sessions = sessionsResponse?.data || [];
  const upcomingList = sessions.filter((s) => s.status === "accepted" || s.status === "pending").slice(0, 3);

  const cards = [
    { label: "Upcoming Sessions", value: stats.upcomingSessions, icon: Calendar, color: "text-blue-500 bg-blue-500/10" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Cancelled Sessions", value: stats.cancelledSessions, icon: XCircle, color: "text-rose-500 bg-rose-500/10" },
    { label: "Mentors Guided By", value: stats.mentorsWorkedWith, icon: Users, color: "text-violet-500 bg-violet-500/10" },
  ];

  const isLoading = isDashLoading || isSessionsLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Student Workspace</h2>
        <p className="text-muted-foreground mt-1">Track your schedules, goals, and resource bookmarks.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : cards.map((card, i) => {
              const Icon = card.icon;
              const handleClick = () => {
                const statusMap = {
                  "Upcoming Sessions": "accepted",
                  "Completed Sessions": "completed",
                  "Cancelled Sessions": "cancelled",
                };
                const status = statusMap[card.label];
                if (status) {
                  navigate(`/student/sessions?status=${status}`);
                } else {
                  navigate("/mentors?filter=guided");
                }
              };
              return (
                <button
                  key={i}
                  onClick={handleClick}
                  className="text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl group transition-all"
                >
                  <Card className="border border-border/80 shadow-sm bg-card rounded-2xl hover:border-primary/40 hover:shadow-md transition-all h-full">
                    <CardContent className="p-5 flex items-center justify-between h-full">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                          {card.label}
                        </span>
                        <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl shrink-0 ${card.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
      </div>

      {/* Main Grid: Upcoming Sessions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions list */}
        <Card className="lg:col-span-2 border border-border/80 shadow-sm bg-card rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Upcoming Bookings
              </h3>
              <Link to="/student/sessions" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : upcomingList.length > 0 ? (
              <div className="divide-y divide-border/40">
                {upcomingList.map((session) => (
                  <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          Session with {session.mentorName || "Mentor"}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-3xs uppercase tracking-wider rounded-md font-semibold ${
                            session.status === "accepted"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                          }`}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        {session.agenda || "No agenda provided."}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(session.scheduledAt), "PPP p")}
                        </span>
                        <span>•</span>
                        <span>{session.durationInMinutes} mins</span>
                      </div>
                    </div>
                    {session.status === "accepted" && session.meetingLink && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0 self-start sm:self-center gap-1.5 border-border/80">
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 text-blue-500" />
                          Join Meeting
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                <Calendar className="h-8 w-8 text-muted-foreground/60" />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">No upcoming bookings</p>
                  <p className="text-xs text-muted-foreground">Connect with one of our mentors to start learning</p>
                </div>
                <Button asChild size="sm" className="rounded-xl mt-1">
                  <Link to="/mentors" className="gap-1.5">
                    <Compass className="h-4 w-4" />
                    Browse Mentors
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Utilities */}
        <Card className="border border-border/80 shadow-sm bg-card rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              Resources Catalog
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore shared books, coding exercises, PDFs, and checklists created by our community mentors.
            </p>
            <Button asChild variant="outline" className="w-full justify-center rounded-xl border-border/80 gap-1.5">
              <Link to="/books">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                Browse Resources
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
