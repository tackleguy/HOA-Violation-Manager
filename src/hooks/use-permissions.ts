"use client";

import {
  canApproveArchitecturalRequests,
  canInvite,
  canManage,
  canManageOrganization,
  canUploadEvidence,
  canViewModule,
  canWrite,
  canWriteModule,
  type AppModule,
  type AppRole
} from "@/lib/permissions";

export function usePermissions(role: AppRole) {
  return {
    role,
    canWrite: () => canWrite(role),
    canManage: () => canManage(role),
    canInvite: () => canInvite(role),
    canManageOrganization: () => canManageOrganization(role),
    canUploadEvidence: () => canUploadEvidence(role),
    canApproveArchitecturalRequests: () => canApproveArchitecturalRequests(role),
    canViewModule: (module: AppModule) => canViewModule(role, module),
    canWriteModule: (module: AppModule) => canWriteModule(role, module),
    isReadOnly: role === "read_only"
  };
}
