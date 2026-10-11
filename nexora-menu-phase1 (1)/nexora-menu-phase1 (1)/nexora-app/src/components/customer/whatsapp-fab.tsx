import { Phone } from "lucide-react";

export function WhatsappFab({ number }: { number: string }) {
  return (
    <a
      href={`https://wa.me/${number.replace(/[^0-9]/g, "")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-105"
    >
      <Phone className="h-6 w-6 fill-white text-white" />
    </a>
  );
}
