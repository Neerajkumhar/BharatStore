import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero';
import { ProductEcosystem } from '@/components/landing/product-ecosystem';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { StorefrontShowcase } from '@/components/landing/storefront-showcase';
import { PosShowcase } from '@/components/landing/pos-showcase';
import { InventoryGstSection } from '@/components/landing/inventory-gst';
import { CustomerKhataSection } from '@/components/landing/customer-khata';
import { MarketingShowcase } from '@/components/landing/marketing-showcase';
import { AnalyticsShowcase } from '@/components/landing/analytics-showcase';
import { SecuritySection } from '@/components/landing/security-section';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { BusinessUseCases } from '@/components/landing/business-use-cases';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-amber-500 selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <ProductEcosystem />
        <ProductShowcase />
        <StorefrontShowcase />
        <PosShowcase />
        <InventoryGstSection />
        <CustomerKhataSection />
        <MarketingShowcase />
        <AnalyticsShowcase />
        <SecuritySection />
        <WorkflowSection />
        <BusinessUseCases />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
