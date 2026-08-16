import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { Clock, Calendar, CheckCircle, Star, MessageSquare, X, ChevronRight, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getMentorDashboardApi,
  getMentorSessionsApi,
  acceptSessionApi,
  rejectSessionApi,
  completeSessionApi,
  getMentorReviewsApi,
} from "@/api/mentorship.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MentorDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectingSessionId, setRejectingSessionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Queries
  const mentorId = user?.id || user?._id;
  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["mentorReviews", mentorId],
    queryFn: () => getMentorReviewsApi(mentorId),
    enabled: !!mentorId,
  });

  const reviews = reviewsResponse?.data || [];
  const { data: dashResponse, isLoading: isDashLoading } = useQuery({
    queryKey: ["mentorDashboard"],
    queryFn: getMentorDashboardApi,
  });

  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["mentorSessions"],
    queryFn: getMentorSessionsApi,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const stats = dashResponse?.data || {
    pendingRequests: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalReviews: 0,
    averageRating: 0.0,
  };

  const sessions = sessionsResponse?.data || [];

  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const upcomingSessions = sessions.filter((s) => s.status === "accepted");

  // Stats Card Layout
  const cards = [
    { label: "Pending Invites", value: stats.pendingRequests, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
    { label: "Upcoming Bookings", value: stats.upcomingSessions, icon: Calendar, color: "text-blue-500 bg-blue-500/10" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Total Reviews", value: stats.totalReviews, icon: MessageSquare, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Average Rating", value: `${stats.averageRating} / 5`, icon: Star, color: "text-yellow-500 bg-yellow-500/10" },
  ];

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: acceptSessionApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Session accepted!");
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
      } else {
        toast.error(res.message || "Failed to accept session");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to accept session");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectSessionApi(id, reason),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Session rejected.");
        setRejectingSessionId(null);
        setRejectionReason("");
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
      } else {
        toast.error(res.message || "Failed to reject session");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject session");
    },
    onSettled: () => {
      setIsSubmittingAction(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeSessionApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Session marked as completed!");
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
      } else {
        toast.error(res.message || "Failed to complete session");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to complete session");
    },
  });

  const handleAccept = (id) => {
    acceptMutation.mutate(id);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    setIsSubmittingAction(true);
    rejectMutation.mutate({ id: rejectingSessionId, reason: rejectionReason });
  };

  const handleComplete = (id) => {
    completeMutation.mutate(id);
  };

  const isLoading = isDashLoading || isSessionsLoading;

  return (
    <div className="space-y-8">
      {/* Header welcome */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Mentor Workspace</h2>
        <p className="text-muted-foreground mt-1">Review student scheduling requests and manage your calendar availability.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : cards.map((card, i) => {
              const Icon = card.icon;
              const isReviewCard = card.label === "Total Reviews" || card.label === "Average Rating";
              const handleClick = () => {
                if (isReviewCard) {
                  setIsReviewsOpen(true);
                } else {
                  const statusMap = {
                    "Pending Invites": "pending",
                    "Upcoming Bookings": "accepted",
                    "Completed Sessions": "completed",
                  };
                  const status = statusMap[card.label];
                  navigate(`/mentor/sessions?status=${status}`);
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
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
      </div>

      {/* Main Content Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions Workspace Panel */}
        <Card className="lg:col-span-2 border border-border/80 shadow-sm bg-card rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "pending" ? "default" : "ghost"}
                  onClick={() => setActiveTab("pending")}
                  className="rounded-xl text-xs py-1 h-8"
                >
                  Pending Requests ({pendingSessions.length})
                </Button>
                <Button
                  variant={activeTab === "upcoming" ? "default" : "ghost"}
                  onClick={() => setActiveTab("upcoming")}
                  className="rounded-xl text-xs py-1 h-8"
                >
                  Upcoming Bookings ({upcomingSessions.length})
                </Button>
              </div>
            </div>

            {/* List components */}
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : activeTab === "pending" ? (
              pendingSessions.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {pendingSessions.map((session) => (
                    <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-foreground">
                          Request from {session.studentName || "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                          {session.agenda || "No agenda specified."}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(session.scheduledAt), "PPP p")}
                          </span>
                          <span>•</span>
                          <span>{session.durationInMinutes} mins</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-start sm:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingSessionId(session._id)}
                          className="rounded-xl h-8 border-border/80 hover:bg-destructive/10 hover:text-destructive gap-1.5"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(session._id)}
                          className="rounded-xl h-8 gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                  <Clock className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">No pending session invites</p>
                  <p className="text-xs text-muted-foreground">New booking requests will appear here</p>
                </div>
              )
            ) : upcomingSessions.length > 0 ? (
              <div className="divide-y divide-border/40">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          Meeting with {session.studentName || "Student"}
                        </span>
                        {session.meetingLink && (
                          <Badge variant="secondary" className="text-3xs bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded font-semibold">
                            Live Link
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        {session.agenda || "No agenda specified."}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(session.scheduledAt), "PPP p")}
                        </span>
                        <span>•</span>
                        <span>{session.durationInMinutes} mins</span>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center shrink-0">
                      {session.meetingLink && (
                        <Button asChild size="sm" variant="outline" className="rounded-xl h-8 gap-1.5 border-border/80">
                          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">Join Video</a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleComplete(session._id)}
                        className="rounded-xl h-8 bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No upcoming bookings scheduled</p>
                <p className="text-xs text-muted-foreground">Accepted bookings will be shown here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar settings info */}
        <Card className="border border-border/80 shadow-sm bg-card rounded-2xl h-max">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              Calendar Availability
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Define your availability hours and sync details so that students can find open slots to book 1-on-1 sessions.
            </p>
            <Button asChild variant="outline" className="w-full justify-center rounded-xl border-border/80 gap-1.5">
              <Link to="/mentor/availability">
                Availability Manager
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Decline/Rejection Dialogue Modal */}
      <Dialog open={!!rejectingSessionId} onOpenChange={(open) => !open && setRejectingSessionId(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Decline Scheduling Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Please provide a reason to the student explaining why you cannot accept this session request.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2.5">
            <Textarea
              placeholder="e.g. Schedule conflict. Please reschedule for next Tuesday afternoon."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-muted/10 border-border/80 rounded-xl min-h-[90px] text-sm p-3 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSubmittingAction}
              onClick={() => {
                setRejectingSessionId(null);
                setRejectionReason("");
              }}
              className="rounded-xl border-border/80"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmittingAction}
              onClick={handleRejectSubmit}
              className="rounded-xl"
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Declining...
                </>
              ) : (
                "Decline Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="rounded-2xl max-w-lg p-6 bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Student Reviews</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Feedback from students who completed mentorship sessions with you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2.5 max-h-[350px] overflow-y-auto space-y-4">
            {isReviewsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-xl border border-border/60 bg-muted/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${
                            idx < rev.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(rev.createdAt), "PPP")}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {rev.comment || "No comment provided."}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No reviews yet</p>
                <p className="text-xs text-muted-foreground">Completed sessions with student reviews will appear here</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReviewsOpen(false)} className="rounded-xl w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
