import {
  Activity,
  Archive,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Gauge,
  Gavel,
  Home,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Wrench
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";

export const appName = "HOAFlow";

export { ORG_COOKIE_NAME as organizationCookieName } from "@/lib/org-cookie";

export const navigation = [
  { name: "Overview", href: "/dashboard", icon: Gauge },
  { name: "Residents", href: "/dashboard/residents", icon: Users },
  { name: "Properties", href: "/dashboard/properties", icon: Home },
  { name: "Violations", href: "/dashboard/violations", icon: ShieldCheck },
  { name: "Fines", href: "/dashboard/fines", icon: CircleDollarSign },
  { name: "Board Meetings", href: "/dashboard/meetings", icon: Gavel },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: Wrench },
  { name: "Vendors", href: "/dashboard/vendors", icon: Truck },
  { name: "Architecture", href: "/dashboard/architecture", icon: Building2 },
  { name: "Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Communications", href: "/dashboard/communications", icon: Megaphone },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
];

export const navigationGroups = [
  {
    label: "Overview",
    items: ["Overview", "Search", "Calendar", "Activity"]
  },
  {
    label: "Community",
    items: ["Residents", "Properties", "Violations", "Fines"]
  },
  {
    label: "Operations",
    items: ["Board Meetings", "Work Orders", "Vendors", "Inspections"]
  },
  {
    label: "Records",
    items: ["Architecture", "Documents", "Communications", "Reports"]
  },
  {
    label: "Admin",
    items: ["Settings"]
  }
] as const;

export const portalNavigation = [
  { name: "Portal home", href: "/portal", icon: Home },
  { name: "Violations", href: "/portal/violations", icon: ShieldCheck },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: Megaphone }
];

export const violationCategories = [
  "Landscaping",
  "Parking",
  "Trash bins",
  "Exterior maintenance",
  "Noise complaints",
  "Pet violations",
  "Custom category"
];

export const documentCategories = [
  "CC&Rs",
  "Bylaws",
  "Meeting Minutes",
  "Financial Documents",
  "Community Rules",
  "Architectural Guidelines"
];

export const roles = Object.values(ROLE_LABELS);

export const quickActions = [
  { name: "Create violation", icon: ShieldCheck },
  { name: "Schedule inspection", icon: ClipboardCheck },
  { name: "Upload document", icon: Archive },
  { name: "Add resident", icon: Users }
];
