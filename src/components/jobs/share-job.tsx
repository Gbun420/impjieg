"use client";

import { useState } from "react";
import { Share2, X, Copy, Mail, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHydrated } from "@/hooks/use-hydrated";

export function ShareJobButton({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hydrated = useHydrated();
  const url = hydrated ? window.location.href : "";
  const text = `Check out this job: ${title}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "LinkedIn",
      icon: Globe,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:bg-blue-500/10 hover:text-blue-500",
    },
    {
      name: "Facebook",
      icon: Globe,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-blue-600/10 hover:text-blue-600",
    },
    {
      name: "X / Twitter",
      icon: Globe,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: "hover:bg-gray-500/10 hover:text-gray-500",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`I found this job opportunity and thought you might be interested:\n\n${url}`)}`,
      color: "hover:bg-red-500/10 hover:text-red-500",
    },
    {
      name: "Copy Link",
      icon: Copy,
      url: "#",
      onClick: handleCopy,
      color: "hover:bg-gray-500/10 hover:text-gray-500",
    },
  ];

  if (hydrated && typeof navigator !== "undefined" && navigator.share) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          try {
            await navigator.share({ title, url });
          } catch {
            // User cancelled
          }
        }}
        className="h-8 w-8 p-0"
        title="Share this job"
        aria-label="Share this job"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
        title="Share this job"
        aria-label="Share this job"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Share this job</h3>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-muted/50" aria-label="Close share dialog">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 rounded-xl border border-border/50 p-3 text-sm font-medium text-muted-foreground transition-colors ${link.color}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </a>
              ))}
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
