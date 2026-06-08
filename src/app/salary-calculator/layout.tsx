import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Calculator",
  description: "Calculate your net monthly take-home pay after Malta income tax and NIC contributions.",
};

export default function SalaryCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
