import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-secondary/30 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Free delivery on orders over $35
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-slide-up">
            Fresh groceries,{" "}
            <span className="text-gradient">delivered fast</span>
          </h1>

          {/* Subheading */}
          <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Shop thousands of fresh products from local stores. Get everything you need delivered to your door in as little as 1 hour.
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your delivery address"
                  className="h-14 w-full rounded-xl border-2 border-border bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button variant="hero" size="xl" className="gap-2">
                <Search className="h-5 w-5" />
                Find stores
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">🚀</span>
              <span>1hr delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">🥬</span>
              <span>Always fresh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">💰</span>
              <span>Best prices</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
