import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Footer from "@/components/landing/Footer";
import { useSEO } from "@/hooks/useSEO";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "E-VARA",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "1250",
        "priceCurrency": "USD"
      },
      "description": "Autonomous identity defense and threat monitoring platform for high-value targets."
    },
    {
      "@type": "Organization",
      "name": "E-VARA Security Systems",
      "url": "https://e-vara.vercel.app"
    }
  ]
};

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useSEO({
    title: "Enterprise Identity Defense & Intelligence OS",
    description: "E-VARA provides autonomous identity defense, real-time threat monitoring, and executive security auditing for high-value targets.",
    canonicalUrl: "https://e-vara.vercel.app/"
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050608] text-foreground selection:bg-primary/30 overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      <Hero />
      <FeatureGrid />
      <Footer />
    </div>
  );
};

export default LandingPage;
