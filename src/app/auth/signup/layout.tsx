import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an Impjieg employer account to post roles, reach Malta talent, and manage applications.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
