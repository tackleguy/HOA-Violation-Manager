export const metrics = [
  { label: "Total properties", value: "428", delta: "+12 this month" },
  { label: "Total residents", value: "1,184", delta: "+34 this month" },
  { label: "Active violations", value: "37", delta: "-18% vs last month" },
  { label: "Resolved violations", value: "214", delta: "92% on-time rate" },
  { label: "Pending requests", value: "16", delta: "6 awaiting board review" },
  { label: "Scheduled inspections", value: "42", delta: "Next 30 days" }
];

export const trendData = [
  { month: "Jan", violations: 44, resolved: 36, inspections: 58 },
  { month: "Feb", violations: 39, resolved: 34, inspections: 62 },
  { month: "Mar", violations: 51, resolved: 48, inspections: 69 },
  { month: "Apr", violations: 47, resolved: 53, inspections: 74 },
  { month: "May", violations: 37, resolved: 49, inspections: 81 },
  { month: "Jun", violations: 33, resolved: 46, inspections: 88 }
];

export const activityFeed = [
  { title: "Warning notice sent", meta: "Lot 144 · Parking · 3 minutes ago" },
  { title: "Architectural request approved", meta: "Pergola installation · 18 minutes ago" },
  { title: "Inspection report completed", meta: "North gate section · 42 minutes ago" },
  { title: "Resident profile updated", meta: "Marisol Bennett · 1 hour ago" },
  { title: "Document version published", meta: "Community Rules v4 · 2 hours ago" }
];

export const residents = [
  { name: "Marisol Bennett", property: "1844 Cypress Bend", email: "marisol@example.com", status: "Owner", violations: 0 },
  { name: "Owen Palmer", property: "9013 Lake Vista", email: "owen@example.com", status: "Tenant", violations: 2 },
  { name: "Nadia Shah", property: "77 Stonebridge", email: "nadia@example.com", status: "Owner", violations: 1 },
  { name: "Graham Ellis", property: "421 Mesa Ridge", email: "graham@example.com", status: "Board", violations: 0 }
];

export const properties = [
  { address: "1844 Cypress Bend", parcel: "CB-1844", section: "Cypress", status: "Clear" },
  { address: "9013 Lake Vista", parcel: "LV-9013", section: "Lakeside", status: "Violation" },
  { address: "77 Stonebridge", parcel: "SB-0077", section: "Stonebridge", status: "Review" },
  { address: "421 Mesa Ridge", parcel: "MR-0421", section: "Mesa", status: "Clear" }
];

export const violations = [
  { category: "Parking", property: "9013 Lake Vista", severity: "Medium", status: "Warning Sent", due: "Jun 12" },
  { category: "Landscaping", property: "77 Stonebridge", severity: "Low", status: "Under Review", due: "Jun 18" },
  { category: "Trash bins", property: "2158 Oak Hollow", severity: "Low", status: "Open", due: "Jun 20" }
];

export const architecturalRequests = [
  { title: "Pergola installation", property: "1844 Cypress Bend", status: "Approved", reviewer: "Board Review" },
  { title: "Exterior paint update", property: "77 Stonebridge", status: "Under Review", reviewer: "Design Committee" },
  { title: "Solar panel array", property: "421 Mesa Ridge", status: "Submitted", reviewer: "Pending assignment" }
];

export const inspections = [
  { title: "Monthly exterior sweep", date: "Jun 4", assignee: "Avery Collins", completion: "82%" },
  { title: "Gate and common area audit", date: "Jun 7", assignee: "Sam Rivera", completion: "34%" },
  { title: "Pool safety checklist", date: "Jun 9", assignee: "Jordan Lee", completion: "0%" }
];

export const documents = [
  { name: "CC&Rs", category: "Governing", version: "v8", access: "Residents" },
  { name: "Board Minutes - May", category: "Meeting Minutes", version: "v1", access: "Board" },
  { name: "Architectural Guidelines", category: "Rules", version: "v5", access: "Residents" }
];
