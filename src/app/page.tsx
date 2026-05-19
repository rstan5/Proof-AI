import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureSection } from "@/components/marketing/feature-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { CandidateReportSpecimen } from "@/components/marketing/candidate-report-specimen";
import { RoiSection } from "@/components/marketing/roi-section";
import { StatsMarquee } from "@/components/marketing/stats-marquee";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsMarquee />
        <FeatureSection />
        <HowItWorksSection />
        <CandidateReportSpecimen />
        <RoiSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
