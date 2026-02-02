import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-t border-border py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Stop spraying and praying.
          <br />
          <span className="text-muted-foreground">Start applying smarter.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Join students who are automating their job search while staying truthful, 
          relevant, and organized—even at high volume.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent">
            View Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}
