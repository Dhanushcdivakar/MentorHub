import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Link2, Cpu, Briefcase, Save, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getMyProfileApi, updateMyProfileApi } from "@/api/user.api";
import { uploadFileApi } from "@/api/books.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUserProfile } from "@/redux/slices/userSlice";

export default function Profile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // States
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(0);
  const [profilePicture, setProfilePicture] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleRemoveAvatar = () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    setProfilePicture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const skillsArray = skills
      ? skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const updateData = {
      bio,
      skills: skillsArray,
      profilePicture: "",
      socialLinks: {
        github,
        linkedin,
        portfolio,
      },
    };

    if (profile?.role === "mentor") {
      updateData.experience = Number(experience);
    }

    updateMutation.mutate(updateData, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Profile photo removed successfully!");
        } else {
          toast.error(res.message || "Failed to remove profile photo");
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to remove profile photo");
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP)");
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading("Uploading image...");
      const res = await uploadFileApi(file, "profile");
      toast.dismiss(loadingToast);

      if (res.success && res.data?.url) {
        const newUrl = res.data.url;
        setProfilePicture(newUrl);

        const skillsArray = skills
          ? skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
          : [];

        const updateData = {
          bio,
          skills: skillsArray,
          profilePicture: newUrl,
          socialLinks: {
            github,
            linkedin,
            portfolio,
          },
        };

        if (profile?.role === "mentor") {
          updateData.experience = Number(experience);
        }

        updateMutation.mutate(updateData, {
          onSuccess: (res) => {
            if (res.success) {
              toast.success("Profile photo updated successfully!");
            } else {
              toast.error(res.message || "Failed to update profile photo");
            }
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update profile photo");
          }
        });
      } else {
        toast.error(res.message || "Failed to upload image");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch current user profile
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getMyProfileApi,
  });

  const profile = response?.data;

  // Initialize form values when profile is fetched
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setBio(profile.bio || "");
        setSkills(profile.skills ? profile.skills.join(", ") : "");
        setExperience(profile.experience || 0);
        setProfilePicture(profile.profilePicture || "");
        setGithub(profile.socialLinks?.github || "");
        setLinkedin(profile.socialLinks?.linkedin || "");
        setPortfolio(profile.socialLinks?.portfolio || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: (res) => {
      if (res.success) {
        dispatch(updateUserProfile(res.data));
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const skillsArray = skills
      ? skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const updateData = {
      bio,
      skills: skillsArray,
      profilePicture,
      socialLinks: {
        github,
        linkedin,
        portfolio,
      },
    };

    // Experience only applies to Mentors
    if (profile?.role === "mentor") {
      updateData.experience = Number(experience);
    }

    updateMutation.mutate(updateData, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Profile updated successfully!");
        } else {
          toast.error(res.message || "Failed to update profile");
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    });
  };

  const isSaving = updateMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information, bio, skills, and portfolio connections.
        </p>
      </div>

      {isLoading && (
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </CardContent>
        </Card>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl text-center bg-card">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold mb-1">Failed to load profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "An error occurred while fetching your profile information."}
          </p>
        </div>
      )}

      {!isLoading && !isError && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left panel: Avatar card & metadata */}
          <Card className="border border-border/85 bg-card shadow-sm rounded-2xl md:col-span-1">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div 
                className={`relative rounded-full overflow-hidden bg-muted h-28 w-28 border border-border shadow-sm group ${profilePicture ? "cursor-zoom-in hover:brightness-95 transition-all" : ""}`}
                onClick={() => profilePicture && setIsPreviewOpen(true)}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-4 text-muted-foreground" />
                )}
                {profilePicture && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">View</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading || isSaving}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading || isSaving}
                  className="rounded-xl border-border/80 text-xs font-semibold px-4"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photo"
                  )}
                </Button>
                {profilePicture && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading || isSaving}
                    className="rounded-xl text-destructive hover:bg-destructive/10 text-xs font-semibold px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">{profile.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
                  <Mail className="h-3 w-3" />
                  {profile.email}
                </p>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-3xs font-semibold text-primary uppercase tracking-wider mt-1 w-max">
                  {profile.role}
                </span>
              </div>

              <div className="w-full border-t border-border/30 pt-4 text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Member Since</p>
                <p className="text-xs text-foreground font-medium">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right panel: Edit Form */}
          <Card className="border border-border/85 bg-card shadow-sm rounded-2xl md:col-span-2">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40 flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-primary" />
                  Personal Information
                </h3>


                {/* Bio text */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="bio">
                    Professional Biography
                  </label>
                  <Textarea
                    id="bio"
                    placeholder="Briefly describe your career background, goals, or areas of focus..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-muted/10 border-border/80 rounded-xl min-h-[120px] text-sm p-3 focus-visible:ring-1 focus-visible:ring-primary leading-relaxed"
                    disabled={isSaving}
                  />
                </div>

                {/* Experience & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.role === "mentor" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground" htmlFor="experience">
                        Years of Experience
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="experience"
                          type="number"
                          min={0}
                          placeholder="e.g. 5"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="pl-9 bg-muted/10 border-border/80 rounded-xl"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="skills">
                      Skills / Technologies
                    </label>
                    <div className="relative">
                      <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="skills"
                        placeholder="e.g. React, Node, Python"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="pl-9 bg-muted/10 border-border/80 rounded-xl"
                        disabled={isSaving}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Separate multiple items with commas.
                    </p>
                  </div>
                </div>

                {/* Social links */}
                <h3 className="font-bold text-base text-foreground pt-4 pb-2 border-b border-border/40 flex items-center gap-2">
                  <Link2 className="h-4.5 w-4.5 text-primary" />
                  Social & Portfolio Connections
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="github">
                      GitHub Profile URL
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="github"
                        placeholder="https://github.com/username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="pl-9 bg-muted/10 border-border/80 rounded-xl"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="linkedin">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="pl-9 bg-muted/10 border-border/80 rounded-xl"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="portfolio">
                      Personal Portfolio URL
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="portfolio"
                        placeholder="https://username.dev"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="pl-9 bg-muted/10 border-border/80 rounded-xl"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold text-primary-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {isPreviewOpen && profilePicture && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all cursor-zoom-out"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="relative max-w-3xl max-h-[80vh] p-2 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={profilePicture} 
              alt="Profile Preview" 
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
            />
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-background/60 hover:bg-background/85 backdrop-blur-sm rounded-full p-2 cursor-pointer transition-colors border border-border shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
