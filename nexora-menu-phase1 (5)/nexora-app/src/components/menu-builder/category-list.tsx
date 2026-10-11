"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import { createCategoryAction } from "@/lib/actions/menu";

interface CategoryListProps {
  categories: { id: string; name: string; count: number }[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryList({ categories, activeId, onSelect }: CategoryListProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createCategoryAction({ name: name.trim() });
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't create category.");
        return;
      }
      setName("");
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3.5 py-3 text-left text-[13px] font-semibold transition-colors",
              activeId === cat.id
                ? "border border-gold/25 bg-gradient-to-r from-gold/[0.15] to-transparent"
                : "border border-transparent text-muted-foreground hover:bg-white/[0.04]",
            )}
          >
            {cat.name}
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-[1px] text-[11px] font-medium">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleCreate} className="mt-2.5 flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="h-9 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[12.5px] outline-none focus-visible:border-gold/50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient text-void"
            aria-label="Save category"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2.5 w-full rounded-lg border border-dashed border-white/[0.12] py-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
        >
          <Plus className="me-1 inline h-3.5 w-3.5" />
          Add Category
        </button>
      )}
    </div>
  );
}
