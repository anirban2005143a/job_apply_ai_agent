import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Safety } from "@/components/landing/safety";
import { Tracker } from "@/components/landing/tracker";
import { Footer } from "@/components/landing/footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <Safety />
      <Tracker />
      <Footer />
    </main>
    </>
  );
}
