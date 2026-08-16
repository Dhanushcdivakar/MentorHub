import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle, AlertCircle, X, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getMentorSessionsApi,
  acceptSessionApi,
  rejectSessionApi,
  completeSessionApi,
  getSessionDetailsApi,
  getSessionTimelineApi,
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

export default function MentorSessions() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState(() => {
    const status = searchParams.get("status");
    return status ? status.toLowerCase() : "all";
  });

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      const next = status.toLowerCase();
      const timer = setTimeout(() => {
        setFilterStatus(next);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const [rejectingSessionId, setRejectingSessionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState(null);

  // Queries
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["mentorSessions"],
    queryFn: getMentorSessionsApi,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { data: detailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["sessionDetails", detailSessionId],
    queryFn: () => getSessionDetailsApi(detailSessionId),
    enabled: !!detailSessionId,
  });

  const { data: timelineResponse, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["sessionTimeline", detailSessionId],
    queryFn: () => getSessionTimelineApi(detailSessionId),
    enabled: !!detailSessionId,
  });

  const sessionDetails = detailResponse?.data;
  const sessionTimeline = timelineResponse?.data || [];


  const sessions = response?.data || [];

  // Filtered List
  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: acceptSessionApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Session accepted!");
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
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
        toast.success("Session declined.");
        setRejectingSessionId(null);
        setRejectionReason("");
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
      } else {
        toast.error(res.message || "Failed to decline session");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to decline session");
    },
    onSettled: () => {
      setIsSubmittingAction(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeSessionApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Session completed!");
        queryClient.invalidateQueries({ queryKey: ["mentorSessions"] });
        queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
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
      toast.error("Please enter a reason for declining");
      return;
    }
    setIsSubmittingAction(true);
    rejectMutation.mutate({ id: rejectingSessionId, reason: rejectionReason });
  };

  const handleComplete = (id) => {
    completeMutation.mutate(id);
  };

  const statuses = ["all", "pending", "accepted", "completed", "rejected", "cancelled"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Mentor Sessions Ledger</h2>
        <p className="text-sm text-muted-foreground mt-1">Review student scheduling requests and completed sessions history.</p>
      </div>

      {/* Toolbar Status Filters */}
      <div className="flex gap-2 flex-wrap pb-2 border-b border-border/40">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status)}
            className="rounded-xl text-xs py-1 px-3 h-8 capitalize border-border/80"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* error */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl text-center bg-card">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold mb-1">Failed to load sessions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "An error occurred while loading mentorship requests."}
          </p>
        </div>
      )}

      {/* Ledger list */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <Card key={session._id} className="border border-border/80 shadow-sm bg-card rounded-2xl hover:border-primary/20 transition-all duration-200">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-foreground">
                        Session with {session.studentName || "Student"}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-3xs uppercase tracking-wider rounded-md font-semibold ${
                          session.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                            : session.status === "accepted"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-500"
                            : session.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-500"
                            : session.status === "cancelled"
                            ? "bg-slate-500/10 text-slate-600 dark:text-slate-500"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                        }`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {session.agenda || "No agenda specified."}
                    </p>
                    {session.status === "rejected" && session.rejectionReason && (
                      <p className="text-xs font-medium text-destructive">
                        Reason: {session.rejectionReason}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(session.scheduledAt), "PPP p")}
                      </span>
                      <span>•</span>
                      <span>{session.durationInMinutes} mins</span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-start md:self-center shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailSessionId(session._id)}
                      className="flex-1 md:flex-none rounded-xl h-8 border-border/80 text-foreground gap-1.5"
                    >
                      <Clock className="h-4 w-4" />
                      Details
                    </Button>

                    {session.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingSessionId(session._id)}
                          className="flex-1 md:flex-none rounded-xl h-8 border-border/80 hover:bg-destructive/10 hover:text-destructive gap-1.5"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(session._id)}
                          className="flex-1 md:flex-none rounded-xl h-8 gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                      </>
                    )}

                    {session.status === "accepted" && (
                      <>
                        {session.meetingLink && (
                          <Button asChild size="sm" variant="outline" className="flex-1 md:flex-none rounded-xl h-8 gap-1.5 border-border/80">
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">Join Video</a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleComplete(session._id)}
                          className="flex-1 md:flex-none rounded-xl h-8 bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold gap-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-2 border border-dashed border-border/80 rounded-2xl bg-card">
              <Clock className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">No sessions in this filter</p>
              <p className="text-xs text-muted-foreground">Adjust status filter or search queries.</p>
            </div>
          )}
        </div>
      )}

      {/* Decline Dialog Modal */}
      <Dialog open={!!rejectingSessionId} onOpenChange={(open) => !open && setRejectingSessionId(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Decline Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Please enter a reason why you cannot accept this session request.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="e.g. Booking conflict. Please choose a slot later in the week."
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

      {/* Session Details & Timeline Dialog */}
      <Dialog open={!!detailSessionId} onOpenChange={(open) => !open && setDetailSessionId(null)}>
        <DialogContent className="rounded-2xl max-w-lg p-6 bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Session details & timeline</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              View current progress, history events, and scheduling details.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading || isTimelineLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-3/4 rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            sessionDetails && (
              <div className="space-y-5 py-2">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl border border-border/40 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-0.5">Student</span>
                    <span className="font-bold text-foreground">{sessionDetails.studentName || "Student"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-0.5">Status</span>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-md mt-0.5 bg-primary/10 text-primary">
                      {sessionDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-0.5">Date & Time</span>
                    <span className="font-medium text-foreground">
                      {sessionDetails.scheduledAt ? format(new Date(sessionDetails.scheduledAt), "PPP p") : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-0.5">Duration</span>
                    <span className="font-medium text-foreground">{sessionDetails.durationInMinutes} Minutes</span>
                  </div>
                </div>

                {/* Agenda text */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">Agenda</span>
                  <p className="text-xs text-foreground leading-relaxed bg-muted/5 p-3 rounded-lg border border-border/30">
                    {sessionDetails.agenda || "No agenda provided."}
                  </p>
                </div>

                {/* Meeting details */}
                {sessionDetails.meetingLink && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">Meeting Connection</span>
                    <div className="flex items-center justify-between gap-3 p-3 bg-blue-500/5 text-blue-600 rounded-lg border border-blue-500/10">
                      <span className="text-xs truncate font-medium max-w-[280px]">{sessionDetails.meetingLink}</span>
                      <Button asChild size="sm" variant="outline" className="rounded-lg text-blue-500 hover:text-blue-600 border-blue-500/20 bg-background text-[10px] h-7 px-2">
                        <a href={sessionDetails.meetingLink} target="_blank" rel="noopener noreferrer">Join Call</a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rejection / Cancellation logic */}
                {sessionDetails.rejectionReason && (
                  <div className="space-y-1">
                    <span className="font-semibold text-destructive uppercase text-[10px] tracking-wider block">Rejection Reason</span>
                    <p className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10 leading-normal">
                      {sessionDetails.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Timeline section */}
                <div className="space-y-3 pt-2">
                  <span className="font-bold text-sm text-foreground block">Event History Log</span>
                  <div className="space-y-0.5 max-h-[160px] overflow-y-auto pr-1">
                    {sessionTimeline.length > 0 ? (
                      sessionTimeline.map((event, idx) => (
                        <div key={event._id || idx} className="relative pl-6 pb-3 border-l border-border/50 last:pb-0 last:border-none">
                          <div className="absolute left-0 top-1.5 -translate-x-1/2 rounded-full h-2 w-2 bg-primary ring-2 ring-background" />
                          <p className="text-xs font-bold text-foreground capitalize leading-snug">
                            {event.eventType ? event.eventType.toLowerCase().replace(/_/g, " ") : "status updated"}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {event.timestamp ? format(new Date(event.timestamp), "PP p") : ""}
                          </p>
                          {event.payload?.rejectionReason && (
                            <p className="text-2xs text-destructive mt-0.5">Reason: {event.payload.rejectionReason}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No events logged for this session yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          <DialogFooter>
            <Button onClick={() => setDetailSessionId(null)} className="rounded-xl w-full">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
