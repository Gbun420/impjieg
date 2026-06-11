import { Metadata } from "next";
import { PermitFitForm } from "@/components/permitfit/permitfit-form";
import { Badge } from "@/components/ui/badge";
import { PERMITFIT_DISCLAIMER } from "@/lib/permitfit/constants";

export const metadata: Metadata = {
  title: "PermitFit by Impjieg | Malta TCN hiring signal",
  description:
    "Standalone pilot for checking employer-declared and candidate-declared TCN work-status signals before screening.",
};

export default function PermitFitPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="secondary" className="mb-2">Standalone pilot</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          PermitFit by Impjieg
        </h1>
        <p className="text-lg text-muted-foreground">
          Check whether a Malta role and a TCN candidate have a clear work-status and start-date match before wasting screening time.
        </p>
        <div className="pt-4">
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            {PERMITFIT_DISCLAIMER}
          </p>
        </div>
      </div>

      <PermitFitForm />
    </div>
  );
}
