import type { Metadata } from "next";
import { AuthCard } from "@/components/shared/auth-card";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return <AuthCard mode="register" />;
}
