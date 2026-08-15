import { LayoutDashboard, Calendar, Compass, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

export const APP_NAME = "MentorHub";

export const PUBLIC_NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Mentors", path: "/mentors" },
  { label: "Books", path: "/books" },
  { label: "About", path: "/about" },
];

export const DEFAULT_BOOKING_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export const DURATION_OPTIONS = [15, 30, 45, 60];

export const ROLE_NAV_LINKS = {
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Sessions", path: "/student/sessions", icon: Calendar },
    { label: "Find Mentors", path: "/mentors", icon: Compass },
    { label: "Books Catalog", path: "/books", icon: BookOpen },
    { label: "AI Mentor", path: "/student/ai-mentor", icon: Sparkles },
  ],
  mentor: [
    { label: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
    { label: "Sessions", path: "/mentor/sessions", icon: Calendar },
    { label: "Availability", path: "/mentor/availability", icon: ShieldCheck },
    { label: "Books Catalog", path: "/books", icon: BookOpen },
    { label: "AI Mentor", path: "/mentor/ai-mentor", icon: Sparkles },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Find Mentors", path: "/mentors", icon: Compass },
    { label: "Resources", path: "/admin/books", icon: BookOpen },
  ],
};
