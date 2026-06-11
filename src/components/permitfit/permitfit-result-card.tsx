import { PermitFitResult } from "@/lib/permitfit/scoring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PERMITFIT_DISCLAIMER } from "@/lib/permitfit/constants";

export function PermitFitResultCard({ result }: { result: PermitFitResult | null }) {
  if (!result) return null;

  const getLabelColor = (label: string) => {
    switch (label) {
      case "Strong permit fit":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "Possible permit fit":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "Permit risk":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <Card className="h-full flex flex-col border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLabelColor(result.label)}`}>
            {result.label}
          </span>
          {result.score !== null && (
            <span className="text-sm font-medium text-muted-foreground">
              Score: {result.score}/100
            </span>
          )}
        </div>
        <CardTitle className="text-xl leading-tight">Readiness result</CardTitle>
        <CardDescription className="text-base text-foreground mt-2">
          {result.summary}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col gap-6">
        {result.positiveSignals.length > 0 ? (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Positive signals</h4>
            <ul className="space-y-1.5">
              {result.positiveSignals.map((signal, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Positive signals</h4>
            <p className="text-sm text-muted-foreground/80">No major signals yet.</p>
          </div>
        )}

        {result.riskSignals.length > 0 ? (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Risk signals / Missing information</h4>
            <ul className="space-y-1.5">
              {result.riskSignals.map((signal, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-amber-600 dark:text-amber-400">⚠</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
             <h4 className="font-medium text-sm text-muted-foreground mb-2">Risk signals</h4>
             <p className="text-sm text-muted-foreground/80">No risk signals yet.</p>
          </div>
        )}

        {result.nextQuestions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Suggested next questions</h4>
            <ul className="space-y-1.5">
              {result.nextQuestions.map((q, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {PERMITFIT_DISCLAIMER}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
