import { lazy } from "react";

// General Pages
export const Home = lazy(() => import("../pages/Home/Home"));
export const About = lazy(() => import("../pages/About/About"));
export const Unauthorized = lazy(() => import("../pages/Unauthorized/Unauthorized"));
export const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

// Auth Feature
export const Login = lazy(() => import("../features/auth/pages/Login"));
export const Register = lazy(() => import("../features/auth/pages/Register"));
export const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
export const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));

// Mentorship Discovery
export const Mentors = lazy(() => import("../features/mentorship/pages/Mentors"));

// Books / Resources Catalog
export const Books = lazy(() => import("../features/books/pages/Books"));

// Student Module
export const StudentDashboard = lazy(() => import("../features/dashboard/pages/StudentDashboard"));
export const StudentSessions = lazy(() => import("../features/mentorship/pages/StudentSessions"));
export const BookSession = lazy(() => import("../features/bookings/pages/BookSession"));

// Mentor Module
export const MentorDashboard = lazy(() => import("../features/dashboard/pages/MentorDashboard"));
export const MentorSessions = lazy(() => import("../features/mentorship/pages/MentorSessions"));
export const MentorAvailability = lazy(() => import("../features/mentorship/pages/MentorAvailability"));

// Admin Module
export const AdminDashboard = lazy(() => import("../features/dashboard/pages/AdminDashboard"));
export const AdminBooks = lazy(() => import("../features/books/pages/AdminBooks"));

// Profile Feature
export const Profile = lazy(() => import("../features/dashboard/pages/Profile"));

// AI Feature
export const AIMentor = lazy(() => import("../features/dashboard/pages/AIMentor"));

