"use client";

import * as React from "react";
import type { Specification } from "@/lib/schemas";
import { generateMarkdown, generateFilename } from "@/lib/markdown-export";

type ExportFormat = "markdown" | "gherkin" | "json";

interface SpecExportProps {
  spec: Specification;
  includeMetadata?: boolean;
}

/**
 * Specification Export Component
 *
 * Provides download, copy to clipboard, and preview functionality
 * for exporting specifications to various formats.
 *
 * Usage:
 * ```tsx
 * <SpecExport spec={specification} includeMetadata={true} />
 * ```
 */
export function SpecExport({ spec, includeMetadata = false }: SpecExportProps) {
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("markdown");
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Generate preview content
  React.useEffect(() => {
    if (showPreview && selectedFormat === "markdown") {
      const markdown = generateMarkdown(spec, includeMetadata);
      setPreviewContent(markdown);
    }
  }, [showPreview, selectedFormat, spec, includeMetadata]);

  /**
   * Downloads the specification in the selected format
   */
  const handleDownload = async () => {
    setIsExporting(true);

    try {
      const response = await fetch("/api/specs/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spec,
          format: selectedFormat,
          includeMetadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Export failed");
      }

      // Get the filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || generateFilename(spec);

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert(error instanceof Error ? error.message : "Failed to export specification");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Copies the Markdown content to clipboard
   */
  const handleCopyToClipboard = async () => {
    const markdown = generateMarkdown(spec, includeMetadata);

    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  /**
   * Toggles the preview modal
   */
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-4">
      {/* Export Controls */}
      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
          Export Specification
        </h3>

        {/* Format Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Format:
          </label>
          <div className="flex gap-2">
            {(["markdown", "gherkin", "json"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setSelectedFormat(format)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedFormat === format
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-zinc-300 text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                }`}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Toggle (Markdown only) */}
        {selectedFormat === "markdown" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="include-metadata"
              checked={includeMetadata}
              onChange={(e) => {
                // This would need to be lifted to parent state in real usage
                console.log("Include metadata:", e.target.checked);
              }}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            <label
              htmlFor="include-metadata"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Include metadata (dialogue turns, personas, etc.)
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isExporting ? "Exporting..." : "Download"}
          </button>

          {selectedFormat === "markdown" && (
            <>
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                {copySuccess ? "Copied!" : "Copy to Clipboard"}
              </button>

              <button
                type="button"
                onClick={handleTogglePreview}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedFormat === "markdown" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-md font-semibold text-black dark:text-zinc-50">
              Markdown Preview
            </h4>
            <button
              type="button"
              onClick={handleTogglePreview}
              className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto rounded border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
            <pre className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
