import {
  Activity,
  Archive,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Gauge,
  Home,
  Megaphone,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";

export const appName = "HOAFlow";

export const navigation = [
  { name: "Overview", href: "/dashboard", icon: Gauge },
  { name: "Residents", href: "/dashboard/residents", icon: Users },
  { name: "Properties", href: "/dashboard/properties", icon: Home },
  { name: "Violations", href: "/dashboard/violations", icon: ShieldCheck },
  { name: "Architecture", href: "/dashboard/architecture", icon: Building2 },
  { name: "Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Communications", href: "/dashboard/communications", icon: Megaphone },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
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

export const roles = [
  "Super Admin",
  "HOA Admin",
  "Board Member",
  "Community Manager",
  "Inspector",
  "Read Only User"
];

export const quickActions = [
  { name: "Create violation", icon: ShieldCheck },
  { name: "Schedule inspection", icon: ClipboardCheck },
  { name: "Upload document", icon: Archive },
  { name: "Add resident", icon: Users }
];
