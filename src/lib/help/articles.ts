export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  sections: Array<{ heading: string; body: string[] }>;
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "getting-started",
    title: "Getting Started with HOAFlow",
    description: "Set up your organization, invite your board, and launch your first workflows.",
    category: "Onboarding",
    sections: [
      {
        heading: "Create your organization",
        body: [
          "Sign up with your work email and create your HOA organization profile.",
          "Add your community name, contact details, and preferred notification settings.",
          "Invite board members, managers, and inspectors with role-based permissions."
        ]
      },
      {
        heading: "Import your community data",
        body: [
          "Upload residents and properties using CSV templates from the dashboard.",
          "Review imported records before enabling resident-facing communications.",
          "Configure violation categories and inspection templates to match your CC&Rs."
        ]
      },
      {
        heading: "Launch daily operations",
        body: [
          "Use the overview dashboard to monitor open violations, inspections, and announcements.",
          "Assign inspectors and managers to modules based on their responsibilities.",
          "Enable audit logging to maintain a complete record of every action."
        ]
      }
    ]
  },
  {
    slug: "violations",
    title: "Violation Management",
    description: "Track complaints, evidence, notices, fines, and resolution history in one place.",
    category: "Operations",
    sections: [
      {
        heading: "Create and classify violations",
        body: [
          "Open a violation from any property record and attach photos, notes, and due dates.",
          "Use severity levels to prioritize enforcement and escalation paths.",
          "Assign categories that align with your governing documents."
        ]
      },
      {
        heading: "Manage the workflow",
        body: [
          "Move violations through open, under review, warning sent, fine pending, resolved, and closed states.",
          "Add internal comments for board review without exposing sensitive notes to residents.",
          "Export violation history for legal review or annual reporting."
        ]
      },
      {
        heading: "Evidence and compliance",
        body: [
          "Upload timestamped evidence to secure storage with organization-scoped access.",
          "Every status change is captured in the activity log for audit readiness.",
          "Use bulk actions to assign, export, or close related violations efficiently."
        ]
      }
    ]
  },
  {
    slug: "inspections",
    title: "Inspections & Field Work",
    description: "Schedule inspections, capture findings, and publish reports with photo evidence.",
    category: "Operations",
    sections: [
      {
        heading: "Plan inspections",
        body: [
          "Create inspection templates for recurring community checks.",
          "Schedule inspections with assigned inspectors and calendar reminders.",
          "Track progress from scheduled to in progress, completed, or canceled."
        ]
      },
      {
        heading: "Capture findings",
        body: [
          "Inspectors can upload photos and structured findings from the field.",
          "Link findings to properties or violations when follow-up is required.",
          "Generate reports with recommendations for board review."
        ]
      },
      {
        heading: "Close the loop",
        body: [
          "Completed inspections feed into the activity timeline and overview metrics.",
          "Use inspection history to demonstrate proactive maintenance to residents.",
          "Export reports for insurance, reserve studies, or vendor coordination."
        ]
      }
    ]
  },
  {
    slug: "billing",
    title: "Billing & Plans",
    description: "Understand HOAFlow pricing tiers, billing cycles, and enterprise options.",
    category: "Account",
    sections: [
      {
        heading: "Plan tiers",
        body: [
          "Starter supports smaller communities with core violation and resident modules.",
          "Professional adds advanced inspections, documents, and communications.",
          "Enterprise includes multi-community management, SSO, and dedicated support."
        ]
      },
      {
        heading: "How billing works",
        body: [
          "Plans are priced per community based on unit count and enabled modules.",
          "Invoices are issued monthly or annually depending on your contract.",
          "Add-ons such as additional storage or premium support are billed separately."
        ]
      },
      {
        heading: "Upgrading and support",
        body: [
          "Contact sales to migrate from legacy tools or onboard a management company portfolio.",
          "Upgrades take effect immediately with prorated billing for the current cycle.",
          "Reach hello@hoaflow.com for billing questions, W-9 requests, or procurement paperwork."
        ]
      }
    ]
  }
];

export function getHelpArticle(slug: string) {
  return HELP_ARTICLES.find((article) => article.slug === slug) ?? null;
}

export function getHelpArticlesByCategory() {
  const grouped = new Map<string, HelpArticle[]>();
  for (const article of HELP_ARTICLES) {
    const items = grouped.get(article.category) ?? [];
    items.push(article);
    grouped.set(article.category, items);
  }
  return Array.from(grouped.entries());
}
