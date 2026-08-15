import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Save, Loader2, Plus, X, User } from "lucide-react";
import toast from "react-hot-toast";

import { getMyProfileApi, updateMyProfileApi } from "@/api/user.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MentorAvailability() {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Weekly availability mock configuration
  const [availability, setAvailability] = useState({
    monday: { active: true, from: "09:00", to: "17:00" },
    tuesday: { active: true, from: "09:00", to: "17:00" },
    wednesday: { active: true, from: "09:00", to: "17:00" },
    thursday: { active: true, from: "09:00", to: "17:00" },
    friday: { active: true, from: "09:00", to: "16:00" },
    saturday: { active: false, from: "10:00", to: "14:00" },
    sunday: { active: false, from: "10:00", to: "14:00" },
  });

  // Query profile
  const { data: response, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfileApi,
  });

  useEffect(() => {
    if (response?.data) {
      const user = response.data;
      const timer = setTimeout(() => {
        setBio(user.bio || "");
        setExperience(user.experience || 0);
        setSkills(user.skills || []);
        if (user.availability) {
          setAvailability(user.availability);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [response]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Availability and profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    updateProfileMutation.mutate({
      bio,
      experience,
      skills,
      availability,
    });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim().toLowerCase();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleDayToggle = (day) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        active: !availability[day].active,
      },
    });
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="space-y-8">
      {/* Header welcome */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Availability & Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your working hours and update your catalog qualifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Profile qualifications */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border border-border/80 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                Mentorship Card
              </h3>

              {/* Experience years */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase" htmlFor="experience">
                  Years of Experience
                </label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  className="bg-muted/10 border-border/80 rounded-xl py-5"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              </div>

              {/* Biography */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase" htmlFor="bio">
                  Short Biography
                </label>
                <Textarea
                  id="bio"
                  placeholder="Share a short summary of your background, experience, and expertise..."
                  className="bg-muted/10 border-border/80 rounded-xl min-h-[120px] text-sm p-3 focus-visible:ring-1 focus-visible:ring-primary leading-relaxed"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Skills Tags List */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Expertise Skills
                </label>
                <form onSubmit={handleAddSkill} className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. react, node, system design"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl h-9"
                  />
                  <Button type="submit" size="sm" className="rounded-xl h-9 gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </form>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs bg-muted/70 text-muted-foreground capitalize font-medium rounded-lg flex items-center gap-1 py-0.5 px-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-destructive text-muted-foreground/60 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Hours configuration grid */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" />
                Configure Availability Hours
              </h3>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayConfig = availability[day];
                  return (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border/20 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`check-${day}`}
                          checked={dayConfig.active}
                          onChange={() => handleDayToggle(day)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label
                          htmlFor={`check-${day}`}
                          className={`text-sm font-semibold capitalize cursor-pointer select-none ${
                            dayConfig.active ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </label>
                      </div>

                      {dayConfig.active ? (
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <input
                            type="time"
                            value={dayConfig.from}
                            onChange={(e) => handleTimeChange(day, "from", e.target.value)}
                            className="px-2 py-1 border border-border/80 rounded-lg text-sm bg-muted/10 font-medium"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={dayConfig.to}
                            onChange={(e) => handleTimeChange(day, "to", e.target.value)}
                            className="px-2 py-1 border border-border/80 rounded-lg text-sm bg-muted/10 font-medium"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic self-end sm:self-center">
                          Unavailable
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/40">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Availability & Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
