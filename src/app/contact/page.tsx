import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      <Card className="mt-8 p-8 text-center">
        <Mail className="mx-auto h-10 w-10 text-secondary" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Email Us
        </h2>
        <p className="mt-2 text-muted-foreground">
          For general enquiries, support, or partnership opportunities:
        </p>
        <a
          href={`mailto:${SITE.email}`}
          className="mt-4 inline-block text-lg font-medium text-secondary hover:underline"
        >
          {SITE.email}
        </a>
      </Card>
    </div>
  );
}
