import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { AmbientBackground } from "@/components/shared/ambient-background";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <AmbientBackground />
      <div className="relative z-10">
        <MarketingNavbar />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
