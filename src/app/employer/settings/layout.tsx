import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Settings",
  description: "Manage your employer profile, billing, and notification preferences on Impjieg.",
};

export default function EmployerSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
