const baseUrl = process.env.HOAFLOW_SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const failures = [];

await check("landing page", "/", {
  status: 200,
  headers: {
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  }
});

await check("dashboard", "/dashboard", { status: 200 });
await check("violations dashboard", "/dashboard/violations", { status: 200 });
await check("reports dashboard", "/dashboard/reports", { status: 200 });
await check("help center", "/help", { status: 200 });
await check("documents dashboard", "/dashboard/documents", { status: 200 });
await check("update password", "/update-password", { status: 200 });

const health = await check("health endpoint", "/api/health", { status: 200, json: true });
if (health?.ok !== true || health?.service !== "HOAFlow") {
  failures.push("health endpoint returned an unexpected JSON payload");
}

for (const path of [
  "/api/residents",
  "/api/properties",
  "/api/violations",
  "/api/documents",
  "/api/architectural-requests",
  "/api/inspections",
  "/api/activity"
]) {
  const response = await fetch(`${baseUrl}${path}`);
  if (![401, 403, 503].includes(response.status)) {
    failures.push(`${path} expected protected status 401/403/503, got ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    failures.push(`${path} expected JSON error response`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`HOAFlow smoke tests passed against ${baseUrl}.`);

async function check(name, path, options) {
  const response = await fetch(`${baseUrl}${path}`);
  if (response.status !== options.status) {
    failures.push(`${name} expected ${options.status}, got ${response.status}`);
  }

  for (const [key, expected] of Object.entries(options.headers ?? {})) {
    const actual = response.headers.get(key);
    if (actual !== expected) {
      failures.push(`${name} expected header ${key}: ${expected}, got ${actual}`);
    }
  }

  if (options.json) {
    return response.json().catch(() => {
      failures.push(`${name} did not return valid JSON`);
      return null;
    });
  }

  return null;
}
