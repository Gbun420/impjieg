"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, Building2, MapPin } from "lucide-react";
import { respondToContactRequest } from "@/lib/talent-directory/actions";
import { resolveDisplayName } from "@/lib/talent-directory/resolver";

type ContactRequest = {
  id: string;
  message: string;
  status: string;
  candidate_response_message: string | null;
  employer_visible_email: string | null;
  employer_visible_phone: string | null;
  created_at: string;
  employer?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    location: string | null;
  } | null;
};

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  accepted: { label: "Accepted", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "error", icon: XCircle },
  expired: { label: "Expired", variant: "secondary", icon: Clock },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
};

export function ContactRequestsList({ requests }: { requests: ContactRequest[] }) {
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRespond = (requestId: string, status: "accepted" | "rejected") => {
    startTransition(async () => {
      setMessage(null);
      const result = await respondToContactRequest({
        requestId,
        status,
        responseMessage: responseMessage || undefined,
      });
      if (result.ok) {
        setMessage({ type: "success", text: result.message ?? "Response recorded" });
        setExpandedId(null);
        setResponseMessage("");
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pending Requests */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card className="mt-4 p-8 text-center">
            <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">No pending requests</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-4">
            {pending.map((req) => (
              <Card key={req.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{req.employer?.name}</p>
                      {req.employer?.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {req.employer.location}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-foreground">{req.message}</p>
                    </div>
                  </div>
                  <Badge variant={STATUS_CONFIG[req.status]?.variant as any}>
                    {STATUS_CONFIG[req.status]?.label}
                  </Badge>
                </div>

                {expandedId === req.id ? (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Optional response message..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRespond(req.id, "accepted")}
                        disabled={isPending}
                        variant="primary"
                        size="sm"
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRespond(req.id, "rejected")}
                        disabled={isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => { setExpandedId(null); setResponseMessage(""); }}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setExpandedId(req.id)}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Respond
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Other Requests */}
      {others.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            History ({others.length})
          </h2>
          <div className="mt-4 space-y-3">
            {others.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{req.employer?.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                    {req.employer_visible_email && req.status === "accepted" && (
                      <p className="mt-2 text-sm text-green-600">
                        Contact: {req.employer_visible_email}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_CONFIG[req.status]?.variant as any}>
                    {STATUS_CONFIG[req.status]?.label}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
