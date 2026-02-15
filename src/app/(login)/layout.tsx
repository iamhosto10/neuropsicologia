import type { Metadata } from "next";
import { DashboardShell } from "@/components/profile/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel de control",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
