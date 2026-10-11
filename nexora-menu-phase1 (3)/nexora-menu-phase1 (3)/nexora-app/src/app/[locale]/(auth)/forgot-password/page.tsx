import type { Metadata } from "next";
import { ForgotPasswordCard } from "@/components/shared/forgot-password-card";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordCard />;
}
