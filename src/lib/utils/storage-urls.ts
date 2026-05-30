export type StorageBucket =
  | "hoa-documents"
  | "violation-evidence"
  | "architectural-files"
  | "inspection-reports";

export type SignedUrlOptions = {
  expiresIn?: number;
  download?: boolean;
  fileName?: string;
};

const DEFAULT_EXPIRY_SECONDS = 3600;

export function buildStorageObjectPath(organizationId: string, segments: string[], fileName: string) {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  return [organizationId, ...segments, sanitized].filter(Boolean).join("/");
}

export function parseStoragePath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) {
    return { organizationId: "", segments: [], fileName: "" };
  }
  const [organizationId, ...rest] = parts;
  const fileName = rest.at(-1) ?? "";
  const segments = rest.slice(0, -1);
  return { organizationId, segments, fileName };
}

export function getPublicStorageUrl(supabaseUrl: string, bucket: StorageBucket, path: string) {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function buildSignedUrlRequest(bucket: StorageBucket, path: string, options: SignedUrlOptions = {}) {
  return {
    bucket,
    path,
    expiresIn: options.expiresIn ?? DEFAULT_EXPIRY_SECONDS,
    download: options.download ?? false,
    fileName: options.fileName
  };
}

export async function createSignedStorageUrl(
  createSignedUrl: (path: string, expiresIn: number, options?: { download?: string | boolean }) => Promise<{
    data: { signedUrl: string } | null;
    error: { message: string } | null;
  }>,
  path: string,
  options: SignedUrlOptions = {}
): Promise<string | null> {
  const expiresIn = options.expiresIn ?? DEFAULT_EXPIRY_SECONDS;
  const downloadOption = options.download ? (options.fileName ?? true) : undefined;
  const { data, error } = await createSignedUrl(path, expiresIn, { download: downloadOption });
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export function isStoragePath(value: string) {
  return value.length > 0 && !value.startsWith("http://") && !value.startsWith("https://");
}

export function getBucketFromPath(path: string): StorageBucket | null {
  if (path.includes("/violations/") || path.includes("/evidence/")) return "violation-evidence";
  if (path.includes("/architectural/")) return "architectural-files";
  if (path.includes("/inspections/")) return "inspection-reports";
  if (path.includes("/documents/")) return "hoa-documents";
  return "hoa-documents";
}
