import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PRICING } from "@/lib/constants";

const standardFeatures = [
  "30-day active listing",
  "Visible in search results",
  "Direct candidate applications",
  "Basic analytics dashboard",
];

const featuredFeatures = [
  ...standardFeatures,
  "Homepage featured placement",
  "Top of search results",
  "Highlighted job card",
  "Priority candidate matching",
  "Social media promotion",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Post your job and reach Malta&apos;s top talent
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Standard */}
        <Card className="p-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {PRICING.standard.label}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {PRICING.standard.description}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-foreground">
                €{PRICING.standard.price}
              </span>
              <span className="text-muted-foreground">/listing</span>
            </div>
            <Link href="/employer/post-job" className="mt-6 block">
              <Button variant="outline" size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
          <ul className="mt-8 space-y-3">
            {standardFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span className="text-sm text-muted-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Featured */}
        <Card className="relative border-secondary/50 p-8">
          <Badge
            variant="accent"
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            Most Popular
          </Badge>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {PRICING.featured.label}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {PRICING.featured.description}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-foreground">
                €{PRICING.featured.price}
              </span>
              <span className="text-muted-foreground">/listing</span>
            </div>
            <Link href="/employer/post-job" className="mt-6 block">
              <Button variant="primary" size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
          <ul className="mt-8 space-y-3">
            {featuredFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span className="text-sm text-muted-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
