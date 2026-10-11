import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { Showcase } from "@/components/marketing/showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturesGrid />
      <Showcase />
      <Testimonials />
      <Pricing />
      <Faq />
    </>
  );
}
