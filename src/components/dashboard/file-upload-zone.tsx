"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type FileUploadZoneProps = {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  onFilesSelected: (files: File[]) => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({
  accept,
  multiple = false,
  maxSizeMb = 10,
  disabled = false,
  className,
  onFilesSelected
}: FileUploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  function validateAndSet(selected: File[]) {
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid = selected.filter((file) => file.size <= maxBytes);
    if (valid.length !== selected.length) {
      setError(`Some files exceed the ${maxSizeMb} MB limit.`);
    } else {
      setError(null);
    }
    setFiles(valid);
    if (valid.length > 0) onFilesSelected(valid);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    validateAndSet(selected);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer.files);
    validateAndSet(multiple ? dropped : dropped.slice(0, 1));
  }

  function removeFile(index: number) {
    setFiles((current) => {
      const next = current.filter((_, fileIndex) => fileIndex !== index);
      onFilesSelected(next);
      return next;
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-background p-6 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-primary" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {multiple ? "Multiple files supported" : "Single file"} · Max {maxSizeMb} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              </span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
