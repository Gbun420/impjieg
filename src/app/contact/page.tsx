import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Mail, ExternalLink, MessageSquare } from "lucide-react";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Impjieg. Send us your feedback, questions, or general enquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Have a question, bug report, or partnership idea? Send us a message and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Send a message</h2>
              <p className="text-sm text-muted-foreground">We read every message that comes in.</p>
            </div>
          </div>

          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Email</h2>
                <p className="text-sm text-muted-foreground">For support or partnership requests</p>
              </div>
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              {SITE.email}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Helpful links</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-primary hover:text-primary-hover transition-colors">
                  Browse jobs
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-primary hover:text-primary-hover transition-colors">
                  View pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-primary hover:text-primary-hover transition-colors">
                  Read the blog
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
