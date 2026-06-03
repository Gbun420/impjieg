"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react";

const CSV_TEMPLATE = `title,description,location,sector,jobType,seniority,remoteType,salaryMin,salaryMax,skills,benefits,applicationEmail,applicationUrl,visaFriendly
Senior Developer,"We are looking for...",Sliema,Technology,Full-time,Mid Level,Hybrid,35000,45000,"React,TypeScript",Health insurance,hr@company.com,https://company.com/careers,true`;

export default function BulkUploadPage() {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setFileError("Please upload a CSV file");
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setResults(null);

    const rows = parseCSV(csvContent);
    const errors: string[] = [];
    let success = 0;

    for (const row of rows) {
      if (!row.title) {
        errors.push(`Row ${success + errors.length + 1}: Missing job title`);
        continue;
      }

      const formData = new FormData();
      formData.append("title", row.title);
      formData.append("description", row.description || "");
      formData.append("location", row.location || "");
      formData.append("sector", row.sector || "");
      formData.append("jobType", row.jobtype || "Full-time");
      formData.append("seniority", row.seniority || "");
      formData.append("remoteType", row.remotetype || "");
      formData.append("salaryMin", row.salarymin || "");
      formData.append("salaryMax", row.salarymax || "");
      formData.append("skills", row.skills || "");
      formData.append("benefits", row.benefits || "");
      formData.append("applicationEmail", row.applicationemail || "");
      formData.append("applicationUrl", row.applicationurl || "");
      if (row.visafriendly?.toLowerCase() === "true") {
        formData.append("visaFriendly", "on");
      }
      formData.append("listingType", "standard");

      try {
        const { createJob } = await import("@/lib/actions/jobs");
        const result = await createJob(formData);
        if (result?.error) {
          errors.push(`Row ${success + errors.length + 1}: ${result.error}`);
        } else {
          success++;
        }
      } catch {
        errors.push(`Row ${success + errors.length + 1}: Failed to create job`);
      }
    }

    setResults({ success, failed: errors.length, errors });
    setIsUploading(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impjieg-jobs-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowCount = csvContent.trim() ? csvContent.trim().split("\n").length - 1 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Upload Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Upload multiple jobs at once using a CSV file
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">CSV Template</h2>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="self-start sm:self-auto">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download Template
          </Button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
          {CSV_TEMPLATE.split("\n").slice(0, 2).join("\n")}
        </pre>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Upload CSV</h2>

        <div className="mt-4">
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 p-8 cursor-pointer hover:border-primary/30 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-muted-foreground">CSV files only</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {fileError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-error">
            <AlertCircle className="h-4 w-4" />
            {fileError}
          </div>
        )}

        {csvContent && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {rowCount} job{rowCount !== 1 ? "s" : ""} detected
            </div>

            <Textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="font-mono text-xs min-h-[200px]"
            />

            <Button
              variant="primary"
              size="lg"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={rowCount === 0}
              className="w-full"
            >
              Upload {rowCount} Job{rowCount !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </Card>

      {results && (
        <Card className={`p-6 ${results.failed === 0 ? "border-success/30" : "border-warning/30"}`}>
          <h2 className="text-lg font-semibold text-foreground">Upload Results</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                {results.success} successful
              </div>
              {results.failed > 0 && (
                <div className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="h-4 w-4" />
                  {results.failed} failed
                </div>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="rounded-xl bg-error/5 p-3">
                <ul className="space-y-1 text-xs text-error">
                  {results.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.success > 0 && (
              <Button
                variant="outline"
                onClick={() => router.push("/employer/jobs")}
              >
                View Jobs
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
