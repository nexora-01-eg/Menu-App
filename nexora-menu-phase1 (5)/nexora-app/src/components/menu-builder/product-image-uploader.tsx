"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { compressImage, isImageFile, MAX_UPLOAD_BYTES } from "@/lib/image";
import { uploadProductImageAction, deleteProductImageAction } from "@/lib/actions/upload";
import { useRouter } from "@/i18n/routing";

interface ProductImageUploaderProps {
  productId: string;
  imageUrl: string | null;
  className?: string;
}

export function ProductImageUploader({ productId, imageUrl, className }: ProductImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    if (!isImageFile(file)) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Image is too large (max 8MB before compression).");
      return;
    }

    try {
      const compressed = await compressImage(file);
      const localPreview = URL.createObjectURL(compressed);
      setPreview(localPreview);

      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("file", compressed, "product.jpg");

      startTransition(async () => {
        const result = await uploadProductImageAction(formData);
        if (!result.ok) {
          toast.error(result.error ?? "Upload failed.");
          setPreview(imageUrl);
          return;
        }
        setPreview(result.imageUrl ?? null);
        router.refresh();
      });
    } catch {
      toast.error("Couldn't process that image.");
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductImageAction(productId);
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
        "group relative h-[120px] overflow-hidden rounded-t-xl border-b border-white/[0.08] bg-white/[0.03]",
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
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            loading="lazy"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-void/0 opacity-0 transition-all group-hover:bg-void/50 group-hover:opacity-100">
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
            "flex h-full w-full flex-col items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors",
            isDragging && "bg-gold/10 text-gold",
          )}
        >
          <Upload className="h-4 w-4" />
          Drag & drop or click to upload
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
