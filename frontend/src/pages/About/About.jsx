import { Link } from "react-router-dom";
import { ArrowRight, Compass, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl flex flex-col gap-12">
        {/* Intro */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Our Mission at{" "}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              MentorHub
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We believe that technical knowledge should be easily shared, and career direction should not be left to chance.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="flex flex-col items-center text-center p-6 border border-border/80 rounded-2xl bg-card shadow-sm">
            <div className="rounded-xl bg-primary/10 p-3 text-primary mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Guided Growth</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We provide structured scheduling so that you can receive feedback when you need it most.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 border border-border/80 rounded-2xl bg-card shadow-sm">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Community Driven</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A community of students and seasoned mentors learning and sharing from each other.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 border border-border/80 rounded-2xl bg-card shadow-sm">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">Trusted & Safe</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All user interactions, reviews, and bookings are securely logged and verified.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-border/40 p-8 sm:p-12 text-center flex flex-col items-center gap-6 mt-8">
          <h2 className="text-2xl font-bold text-foreground">Ready to accelerate your career?</h2>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Create an account today. It takes less than 2 minutes to get matched with your next engineering mentor.
          </p>
          <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 font-semibold py-6">
            <Link to="/register" className="gap-2">
              Get Started Now
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
