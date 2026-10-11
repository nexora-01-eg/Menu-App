import { Search, ChevronDown, Bell } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardTopbarProps {
  restaurantName?: string;
}

export function DashboardTopbar({ restaurantName = "Lumière Bistro" }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[65px] items-center justify-between gap-4 border-b border-white/[0.08] bg-void/70 px-5 backdrop-blur-2xl lg:px-8">
      <div className="flex items-center gap-6">
        <Logo href="/dashboard" />
        <button className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-white/20 md:flex">
          {restaurantName}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-muted-foreground md:flex">
        <Search className="h-4 w-4" />
        <span>Search products, offers, orders…</span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Avatar>
          <AvatarFallback>LB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
