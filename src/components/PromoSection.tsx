import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Percent } from "lucide-react";

const PromoSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          {/* App download promo */}
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-10">
            <div className="relative z-10 max-w-xs">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-primary-foreground">
                Get the app
              </h3>
              <p className="mb-6 text-primary-foreground/80">
                Download our app and get $10 off your first order. Plus, enjoy exclusive app-only deals!
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Download now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-primary-foreground/10" />
            <div className="absolute -top-10 -right-20 h-32 w-32 rounded-full bg-primary-foreground/10" />
          </div>

          {/* Weekly deals promo */}
          <div className="relative overflow-hidden rounded-3xl gradient-accent p-8 md:p-10">
            <div className="relative z-10 max-w-xs">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-foreground/20">
                <Percent className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-accent-foreground">
                Weekly deals
              </h3>
              <p className="mb-6 text-accent-foreground/80">
                Save up to 40% on hundreds of items every week. New deals drop every Monday!
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                className="gap-2 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
              >
                Shop deals
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-accent-foreground/10" />
            <div className="absolute -top-10 -right-20 h-32 w-32 rounded-full bg-accent-foreground/10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
