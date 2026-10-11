interface Item {
  id?: string;
  label: string;
  count: number;
}

export function RankedList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-[12px] text-muted-foreground">No data yet</p>;
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={item.id ?? item.label} className="flex items-center gap-3">
          <span className="w-4 shrink-0 font-display text-[12px] text-gold">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate font-medium">{item.label}</span>
              <span className="shrink-0 text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-gold" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
