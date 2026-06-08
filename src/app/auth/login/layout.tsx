import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Impjieg account to manage job listings, applications, and employer dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
