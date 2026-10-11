"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2, Trash2, RefreshCw, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { compressImage, isImageFile, MAX_UPLOAD_BYTES } from "@/lib/image";
import { useRouter } from "@/i18n/routing";
import {
  uploadRestaurantLogoAction,
  deleteRestaurantLogoAction,
  uploadRestaurantCoverAction,
  deleteRestaurantCoverAction,
} from "@/lib/actions/restaurant-profile";

interface RestaurantAssetUploaderProps {
  kind: "logo" | "cover";
  imageUrl: string | null;
  className?: string;
}

export function RestaurantAssetUploader({ kind, imageUrl, className }: RestaurantAssetUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isLogo = kind === "logo";
  const uploadAction = isLogo ? uploadRestaurantLogoAction : uploadRestaurantCoverAction;
  const deleteAction = isLogo ? deleteRestaurantLogoAction : deleteRestaurantCoverAction;

  async function handleFile(file: File) {
    if (!isImageFile(file)) return toast.error("Please choose an image file.");
    if (file.size > MAX_UPLOAD_BYTES) return toast.error("Image is too large (max 8MB).");

    try {
      const compressed = await compressImage(file, isLogo ? { maxWidth: 500 } : { maxWidth: 1600 });
      setPreview(URL.createObjectURL(compressed));

      const formData = new FormData();
      formData.set("file", compressed, `${kind}.jpg`);

      startTransition(async () => {
        const result = await uploadAction(formData);
        if (!result.ok) {
          toast.error(result.error ?? "Upload failed.");
          setPreview(imageUrl);
          return;
        }
        setPreview(result.imageUrl ?? null);
        toast.success(isLogo ? "Logo updated." : "Cover image updated.");
        router.refresh();
      });
    } catch {
      toast.error("Couldn't process that image.");
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAction();
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't remove image.");
        return;
      }
      setPreview(null);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-white/[0.03]",
        isLogo ? "h-28 w-28 rounded-2xl border border-white/[0.08]" : "h-44 w-full rounded-xl border border-white/[0.08]",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {preview ? (
        <>
          <Image
            src={preview}
            alt=""
            fill
            sizes={isLogo ? "112px" : "(max-width: 768px) 100vw, 800px"}
            loading="lazy"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-all group-hover:bg-void/50 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20"
              aria-label="Replace image"
            >
              <RefreshCw className="h-3.5 w-3.5 text-white" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm hover:bg-red-500/70"
              aria-label="Delete image"
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors",
            isDragging && "bg-gold/10 text-gold",
          )}
        >
          {isLogo ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          <span className="text-[10.5px] font-medium">{isLogo ? "Logo" : "Drag & drop cover image"}</span>
        </button>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-void/60">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
        </div>
      )}
    </div>
  );
}
