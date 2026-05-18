import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      <Card className="mt-8 p-8 text-center border-primary/20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Email Us
        </h2>
        <p className="mt-2 text-muted-foreground">
          For general enquiries, support, or partnership opportunities:
        </p>
        <a
          href={`mailto:${SITE.email}`}
          className="mt-4 inline-block text-lg font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {SITE.email}
        </a>
      </Card>
    </div>
  );
}
