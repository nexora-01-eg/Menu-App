import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PopularItem {
  rank: string;
  name: string;
  thumb: string;
  percent: number;
  count: number;
}

interface PopularItemsProps {
  items: PopularItem[];
}

export function PopularItems({ items }: PopularItemsProps) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-5">
        <div className="flex items-center justify-between">
          <CardTitle>Popular Items</CardTitle>
          <CardDescription>This week</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 border-b border-white/[0.08] py-2.5 last:border-none">
            <span className="w-[18px] font-display text-[14px] text-gold">{item.rank}</span>
            <span className={`h-[34px] w-[34px] shrink-0 rounded-lg bg-gradient-to-br ${item.thumb}`} />
            <div className="flex-1">
              <h5 className="text-[12.5px] font-semibold">{item.name}</h5>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gold" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
