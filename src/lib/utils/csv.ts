export type CsvParseOptions = {
  delimiter?: string;
  headers?: boolean;
  skipEmptyLines?: boolean;
};

export type CsvStringifyOptions = {
  delimiter?: string;
  headers?: string[];
};

function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function escapeCsvField(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes(delimiter) || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseCsv(input: string, options: CsvParseOptions = {}): Record<string, string>[] {
  const delimiter = options.delimiter ?? ",";
  const skipEmptyLines = options.skipEmptyLines ?? true;
  const useHeaders = options.headers ?? true;

  const lines = input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => (skipEmptyLines ? line.trim().length > 0 : true));

  if (lines.length === 0) return [];

  const headerRow = parseCsvLine(lines[0], delimiter);
  const dataLines = useHeaders ? lines.slice(1) : lines;
  const headers = useHeaders ? headerRow : headerRow.map((_, index) => `column_${index + 1}`);

  return dataLines.map((line) => {
    const values = parseCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

export function stringifyCsv(rows: Record<string, string>[], options: CsvStringifyOptions = {}): string {
  const delimiter = options.delimiter ?? ",";
  if (rows.length === 0) {
    return options.headers?.join(delimiter) ?? "";
  }

  const headers = options.headers ?? Object.keys(rows[0]);
  const headerLine = headers.map((header) => escapeCsvField(header, delimiter)).join(delimiter);
  const body = rows.map((row) =>
    headers.map((header) => escapeCsvField(row[header] ?? "", delimiter)).join(delimiter)
  );

  return [headerLine, ...body].join("\n");
}

export function csvToBlob(csv: string, mimeType = "text/csv;charset=utf-8"): Blob {
  return new Blob([csv], { type: mimeType });
}

export function downloadCsv(filename: string, csv: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(csvToBlob(csv));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
