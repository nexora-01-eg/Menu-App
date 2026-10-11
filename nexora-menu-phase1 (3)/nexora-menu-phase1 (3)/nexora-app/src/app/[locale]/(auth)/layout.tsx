import { Logo } from "@/components/shared/logo";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { PoweredByNexora } from "@/components/shared/powered-by-nexora";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <AmbientBackground />
      <div className="relative z-10 mb-8">
        <Logo />
      </div>
      <div className="relative z-10 w-full max-w-[400px]">{children}</div>
      <div className="relative z-10 mt-10">
        <PoweredByNexora />
      </div>
    </div>
  );
}
