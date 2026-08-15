import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, GraduationCap, Video, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const features = [
    {
      title: "1-on-1 Mentorship",
      description: "Book real-time video sessions with top-tier industry veterans.",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Direct Scheduling",
      description: "Calendly-style booking slots to match availability seamlessly.",
      icon: Video,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Premium Resources",
      description: "Access curated guides, books, and analytics tools to accelerate learning.",
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Verified Reviews",
      description: "Read transparent feedback left by other students in the community.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-12 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -translate-x-12 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary animate-pulse"
          >
            🚀 Platform Now Live
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground"
          >
            Find your next{" "}
            <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              industry mentor
            </span>{" "}
            today.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Connect 1-on-1 with experts to unlock new skills, resolve complex engineering challenges, and guide your career development.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-violet-600 text-primary-foreground font-semibold shadow-lg shadow-primary/10 py-6">
              <Link to="/mentors" className="gap-2">
                Explore Mentors
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl py-6 border-border/80">
              <Link to="/register">Become a Mentor</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Everything you need to accelerate your path
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            A production-ready network of engineering professionals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Trusted by developers worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Frontend Engineer at Vercel",
              content: "The 1-on-1 session saved me days of debugging. We resolved a complex Next.js caching architecture in under an hour.",
              rating: 5,
            },
            {
              name: "Alex Rivera",
              role: "Self-taught Developer",
              content: "Finding high-quality books and getting detailed roadmap advice helped me land my first software engineer job.",
              rating: 5,
            },
            {
              name: "David Kim",
              role: "Senior Backend Developer",
              content: "Mentoring here has been extremely rewarding. The scheduling dashboard is incredibly clean and hands-off.",
              rating: 5,
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex text-amber-500 gap-0.5">
                  {Array.from({ length: item.rating }).map((_, r) => (
                    <Star key={r} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
