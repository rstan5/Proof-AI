import { CtaBand } from "@/components/marketing/cta-band";
import { BusinessImpactSection } from "@/components/marketing/business-impact-section";
import { FeatureSection } from "@/components/marketing/feature-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { CandidateReportSpecimen } from "@/components/marketing/candidate-report-specimen";
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
        <BusinessImpactSection />
        <HowItWorksSection />
        <CandidateReportSpecimen />
        <FeatureSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
