"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Star, Trash2, Pencil, X, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/routing";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  setPrimaryBranchAction,
  type BranchInput,
} from "@/lib/actions/branch";

export interface BranchData {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  isPrimary: boolean;
}

const emptyForm: BranchInput = { name: "", address: "", phone: "", whatsapp: "" };

export function BranchManager({ branches }: { branches: BranchData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BranchInput>(emptyForm);

  function startEdit(branch: BranchData) {
    setEditingId(branch.id);
    setAdding(false);
    setForm({ name: branch.name, address: branch.address, phone: branch.phone, whatsapp: branch.whatsapp });
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setForm(emptyForm);
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = editingId
        ? await updateBranchAction({ id: editingId, ...form })
        : await createBranchAction(form);

      if (!result.ok) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }
      toast.success(editingId ? "Branch updated." : "Branch added.");
      cancel();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this branch? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteBranchAction(id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't delete branch.");
        return;
      }
      router.refresh();
    });
  }

  function handleSetPrimary(id: string) {
    startTransition(async () => {
      const result = await setPrimaryBranchAction(id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't update branch.");
        return;
      }
      router.refresh();
    });
  }

  const showForm = adding || editingId !== null;

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Each branch can have its own QR code and contact details.</CardDescription>
          </div>
          {!showForm && (
            <Button type="button" variant="ghost" size="sm" onClick={startAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Branch
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="flex flex-col gap-2.5">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h5 className="text-[13.5px] font-semibold">{branch.name}</h5>
                {branch.isPrimary && <Badge variant="gold">Primary</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-muted-foreground">
                {branch.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {branch.address}
                  </span>
                )}
                {branch.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {branch.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!branch.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(branch.id)}
                  disabled={isPending}
                  title="Set as primary"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:border-gold/40 hover:text-gold"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => startEdit(branch)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                disabled={isPending || branches.length <= 1}
                title={branches.length <= 1 ? "A restaurant needs at least one branch" : "Delete"}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:border-red-500/40 hover:text-red-400 disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {showForm && (
          <form
            onSubmit={handleSave}
            className="mt-1 flex flex-col gap-3 rounded-lg border border-gold/25 bg-gold/[0.04] p-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-[12.5px] font-semibold">{editingId ? "Edit branch" : "New branch"}</h5>
              <button type="button" onClick={cancel} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="b-name">Name</Label>
                <Input
                  id="b-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Downtown Branch"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="b-address">Address</Label>
                <Input
                  id="b-address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="b-phone">Phone</Label>
                <Input
                  id="b-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="b-whatsapp">WhatsApp</Label>
                <Input
                  id="b-whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" variant="gold" disabled={isPending} className="self-end">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Add branch"}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}
