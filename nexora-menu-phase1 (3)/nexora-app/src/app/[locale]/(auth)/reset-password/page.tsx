import type { Metadata } from "next";
import { ResetPasswordCard } from "@/components/shared/reset-password-card";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return <ResetPasswordCard />;
}
