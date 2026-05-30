import { describe, expect, it } from "vitest";
import {
  APP_ROLES,
  canApproveArchitecturalRequests,
  canInvite,
  canManage,
  canManageOrganization,
  canUploadEvidence,
  canViewModule,
  canWrite,
  canWriteModule,
  getRoleLabel,
  isAppRole,
  isBoardRole
} from "@/lib/permissions";

describe("permissions", () => {
  it("validates known app roles", () => {
    expect(isAppRole("hoa_admin")).toBe(true);
    expect(isAppRole("invalid_role")).toBe(false);
    expect(APP_ROLES).toHaveLength(6);
  });

  it("returns readable role labels", () => {
    expect(getRoleLabel("read_only")).toBe("Resident Viewer");
    expect(getRoleLabel("community_manager")).toBe("Community Manager");
  });

  it("grants write access to operational roles", () => {
    expect(canWrite("inspector")).toBe(true);
    expect(canWrite("read_only")).toBe(false);
  });

  it("restricts management actions to admins", () => {
    expect(canManage("hoa_admin")).toBe(true);
    expect(canManage("board_member")).toBe(false);
    expect(canManageOrganization("super_admin")).toBe(true);
    expect(canInvite("hoa_admin")).toBe(true);
    expect(canInvite("inspector")).toBe(false);
  });

  it("controls module visibility and write access", () => {
    expect(canViewModule("read_only", "violations")).toBe(true);
    expect(canViewModule("read_only", "settings")).toBe(false);
    expect(canWriteModule("read_only", "violations")).toBe(false);
    expect(canWriteModule("inspector", "violations")).toBe(true);
    expect(canWriteModule("inspector", "communications")).toBe(false);
    expect(canWriteModule("community_manager", "communications")).toBe(true);
  });

  it("handles board and evidence permissions", () => {
    expect(isBoardRole("board_member")).toBe(true);
    expect(isBoardRole("inspector")).toBe(false);
    expect(canApproveArchitecturalRequests("board_member")).toBe(true);
    expect(canApproveArchitecturalRequests("inspector")).toBe(false);
    expect(canUploadEvidence("community_manager")).toBe(true);
    expect(canUploadEvidence("read_only")).toBe(false);
  });
});
