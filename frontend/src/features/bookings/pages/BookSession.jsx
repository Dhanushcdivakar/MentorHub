import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getUserProfileApi } from "@/api/user.api";
import { createSessionApi } from "@/api/mentorship.api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_BOOKING_SLOTS, DURATION_OPTIONS } from "@/constants";

// Zod schema for validation
const bookingSchema = z.object({
  agenda: z.string().trim().min(5, "Please describe your agenda (min 5 characters)").max(1000),
});

export default function BookSession() {
  const queryClient = useQueryClient();
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [duration, setDuration] = useState(30); // Default to 30 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useSelector((state) => state.user.user);

  // Fetch mentor profile using React Query
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["mentorProfile", mentorId],
    queryFn: () => getUserProfileApi(mentorId),
    enabled: !!mentorId,
  });

  const mentor = response?.data;

  const getAvailableSlots = () => {
    if (!mentor || !mentor.availability) return DEFAULT_BOOKING_SLOTS;

    const dayName = format(selectedDate, "eeee").toLowerCase();
    const dayConfig = mentor.availability[dayName];

    if (!dayConfig || !dayConfig.active) return [];

    const [fromH, fromM] = dayConfig.from.split(":").map(Number);
    const fromMins = fromH * 60 + fromM;
    const [toH, toM] = dayConfig.to.split(":").map(Number);
    const toMins = toH * 60 + toM;

    return DEFAULT_BOOKING_SLOTS.filter((slot) => {
      const [sh, sm] = slot.split(":").map(Number);
      const slotStartMins = sh * 60 + sm;
      const slotEndMins = slotStartMins + duration;
      return slotStartMins >= fromMins && slotEndMins <= toMins;
    });
  };

  const availableSlots = getAvailableSlots();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (formData) => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Booking your session...");
    try {
      const [hours, minutes] = selectedTimeSlot.split(":");
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const bookingData = {
        mentorId,
        scheduledAt: scheduledAt.toISOString(),
        durationInMinutes: duration,
        agenda: formData.agenda,
        mentorName: mentor?.name || "Mentor",
        studentName: currentUser?.name || "Student",
      };

      const res = await createSessionApi(bookingData);
      if (res.success) {
        toast.success("Session booked successfully!", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["studentSessions"] });
        queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
        navigate("/student/sessions");
      } else {
        toast.error(res.message || "Booking failed", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to book session. Please try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-80 col-span-1 rounded-2xl" />
          <Skeleton className="h-96 col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !mentor) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Mentor Profile Not Found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load the details for this mentor. They may not exist or the profile is private.
        </p>
        <Button asChild>
          <Link to="/mentors">Back to Mentors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        to="/mentors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Mentors
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Mentor Card Summary */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card className="border border-border/80 shadow-sm rounded-2xl bg-card overflow-hidden">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-full bg-muted overflow-hidden h-20 w-20 border border-border/60">
                  {mentor.profilePicture ? (
                    <img
                      src={mentor.profilePicture}
                      alt={mentor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{mentor.name}</h2>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{mentor.role}</p>
                </div>
              </div>

              <div className="border-t border-border/40 my-2" />

              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Experience</h4>
                  <p className="text-sm font-medium text-foreground">{mentor.experience || 0} Years</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{mentor.bio}</p>
                </div>
                {mentor.skills && mentor.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mentor.skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-3xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form Layout */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="border border-border/80 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-foreground tracking-tight border-b border-border/40 pb-3 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Select Date & Time
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Calendar Component */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Select Date</span>
                  <div className="border border-border/60 rounded-2xl p-1 bg-muted/10 w-max">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        if (d) setSelectedDate(d);
                        setSelectedTimeSlot(""); // Clear time when date changes
                      }}
                      disabled={[
                        { before: new Date() },
                        (date) => {
                          if (!mentor || !mentor.availability) return false;
                          const dayName = format(date, "eeee").toLowerCase();
                          const dayConfig = mentor.availability[dayName];
                          return dayConfig ? !dayConfig.active : false;
                        }
                      ]}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Time Slots & Duration Selection */}
                <div className="flex flex-col gap-5">
                  {/* Duration Options */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((mins) => (
                        <Button
                          key={mins}
                          type="button"
                          variant={duration === mins ? "default" : "outline"}
                          className="flex-1 rounded-xl text-xs py-1"
                          onClick={() => {
                            setDuration(mins);
                            setSelectedTimeSlot("");
                          }}
                        >
                          {mins}m
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Available Slots for {format(selectedDate, "MMM dd, yyyy")}
                    </span>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            className={`rounded-xl text-xs ${
                              selectedTimeSlot === slot
                                ? "bg-primary text-primary-foreground"
                                : "border-border/80 text-muted-foreground hover:bg-muted"
                            }`}
                            onClick={() => setSelectedTimeSlot(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No available slots for this duration/date.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Agenda details form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t border-border/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider" htmlFor="agenda">
                      Session Agenda
                    </label>
                    {selectedTimeSlot && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Selected slot: {selectedTimeSlot} ({duration} mins)
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="agenda"
                    placeholder="Briefly describe what you would like to cover or ask the mentor during this session..."
                    className="bg-muted/10 border-border/80 rounded-xl min-h-[100px] text-sm leading-relaxed p-3 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={isSubmitting}
                    {...register("agenda")}
                  />
                  {errors.agenda && (
                    <p className="text-xs font-medium text-destructive">{errors.agenda.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedTimeSlot}
                  className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Booking Session...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
