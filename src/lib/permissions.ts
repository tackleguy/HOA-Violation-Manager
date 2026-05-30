export type AppRole =
  | "super_admin"
  | "hoa_admin"
  | "board_member"
  | "community_manager"
  | "inspector"
  | "read_only";

export type AppModule =
  | "overview"
  | "residents"
  | "properties"
  | "violations"
  | "architecture"
  | "inspections"
  | "documents"
  | "communications"
  | "reports"
  | "calendar"
  | "search"
  | "activity"
  | "settings"
  | "portal";

export const APP_ROLES: AppRole[] = [
  "super_admin",
  "hoa_admin",
  "board_member",
  "community_manager",
  "inspector",
  "read_only"
];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  hoa_admin: "HOA Admin",
  board_member: "Board Member",
  community_manager: "Community Manager",
  inspector: "Inspector",
  read_only: "Resident Viewer"
};

const WRITE_ROLES = new Set<AppRole>([
  "super_admin",
  "hoa_admin",
  "board_member",
  "community_manager",
  "inspector"
]);

const MANAGE_ROLES = new Set<AppRole>(["super_admin", "hoa_admin"]);

const BOARD_ROLES = new Set<AppRole>(["super_admin", "hoa_admin", "board_member"]);

const COMMUNICATIONS_WRITE_ROLES = new Set<AppRole>([
  "super_admin",
  "hoa_admin",
  "board_member",
  "community_manager"
]);

const MODULE_ACCESS: Record<AppModule, Set<AppRole>> = {
  overview: new Set(APP_ROLES),
  residents: new Set(APP_ROLES),
  properties: new Set(APP_ROLES),
  violations: new Set(APP_ROLES),
  architecture: new Set(APP_ROLES),
  inspections: new Set(APP_ROLES),
  documents: new Set(APP_ROLES),
  communications: new Set(APP_ROLES),
  reports: new Set(["super_admin", "hoa_admin", "board_member", "community_manager", "inspector"]),
  calendar: new Set(APP_ROLES),
  search: new Set(APP_ROLES),
  activity: new Set(["super_admin", "hoa_admin", "board_member", "community_manager", "inspector"]),
  settings: new Set(MANAGE_ROLES),
  portal: new Set(APP_ROLES)
};

const MODULE_WRITE: Record<AppModule, Set<AppRole>> = {
  overview: new Set(),
  residents: WRITE_ROLES,
  properties: WRITE_ROLES,
  violations: WRITE_ROLES,
  architecture: WRITE_ROLES,
  inspections: WRITE_ROLES,
  documents: WRITE_ROLES,
  communications: COMMUNICATIONS_WRITE_ROLES,
  reports: new Set(["super_admin", "hoa_admin", "board_member", "community_manager"]),
  calendar: WRITE_ROLES,
  search: new Set(),
  activity: new Set(),
  settings: MANAGE_ROLES,
  portal: new Set()
};

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function getRoleLabel(role: AppRole) {
  return ROLE_LABELS[role];
}

export function canWrite(role: AppRole) {
  return WRITE_ROLES.has(role);
}

export function canManage(role: AppRole) {
  return MANAGE_ROLES.has(role);
}

export function isBoardRole(role: AppRole) {
  return BOARD_ROLES.has(role);
}

export function canInvite(role: AppRole) {
  return canManage(role);
}

export function canViewModule(role: AppRole, module: AppModule) {
  return MODULE_ACCESS[module].has(role);
}

export function canWriteModule(role: AppRole, module: AppModule) {
  return MODULE_WRITE[module].has(role);
}

export function canManageOrganization(role: AppRole) {
  return canManage(role);
}

export function canUploadEvidence(role: AppRole) {
  return canWrite(role);
}

export function canApproveArchitecturalRequests(role: AppRole) {
  return isBoardRole(role) || role === "community_manager";
}
