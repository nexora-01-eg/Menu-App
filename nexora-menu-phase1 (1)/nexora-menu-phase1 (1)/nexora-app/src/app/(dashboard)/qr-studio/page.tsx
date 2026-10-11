import { AppPageHeader } from "@/components/shared/app-page-header";
import { QrCustomizer } from "@/components/qr-studio/qr-customizer";

export default function QrStudioPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <AppPageHeader
        title="QR Studio"
        description="Design a QR code that matches your brand — then export it in seconds."
      />
      <QrCustomizer menuUrl="nexora.menu/lumiere-bistro" />
    </div>
  );
}
