export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  slug: "privacy" | "terms";
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  description: "How HOAFlow collects, uses, and protects information when you use our platform.",
  lastUpdated: "May 30, 2026",
  sections: [
    {
      id: "overview",
      title: "Overview",
      paragraphs: [
        "HOAFlow, Inc. (\"HOAFlow,\" \"we,\" \"us,\" or \"our\") provides cloud software for homeowners associations, community managers, and related stakeholders. This Privacy Policy explains how we handle personal information when you visit our website, create an account, or use our services (collectively, the \"Services\").",
        "By using the Services, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use the Services."
      ]
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "Account information: name, email address, password (stored in hashed form), organization name, and role assignments when you register or are invited to a workspace.",
        "Community and operational data: information your organization uploads or enters into HOAFlow, such as property records, resident contact details, violation records, inspection notes, documents, fines, meeting notes, and communications related to HOA operations.",
        "Usage and device data: log data, IP address, browser type, pages viewed, feature usage, timestamps, and diagnostic information used to operate, secure, and improve the Services.",
        "Support and communications: messages you send to us, feedback, and records of support requests.",
        "Payment information: if you purchase a paid plan, billing details are processed by our payment provider. We do not store full payment card numbers on our servers."
      ]
    },
    {
      id: "how-we-use-information",
      title: "How we use information",
      paragraphs: [
        "Provide, maintain, and improve the Services, including authentication, multi-tenant organization management, and feature delivery.",
        "Process transactions, send service-related notices, and respond to support requests.",
        "Monitor security, prevent fraud and abuse, enforce our Terms of Service, and comply with legal obligations.",
        "Analyze aggregated or de-identified usage to improve product performance and reliability.",
        "Send product updates or marketing communications where permitted by law. You may opt out of marketing emails at any time."
      ]
    },
    {
      id: "how-we-share",
      title: "How we share information",
      paragraphs: [
        "Within your organization: data you submit is visible to authorized users in your HOAFlow workspace according to role-based permissions configured by your organization.",
        "Service providers: we use trusted vendors for hosting, authentication, email delivery, analytics, and payment processing. These providers may access information only to perform services on our behalf and under contractual confidentiality obligations.",
        "Legal requirements: we may disclose information if required by law, regulation, legal process, or governmental request, or when we believe disclosure is necessary to protect rights, safety, or property.",
        "Business transfers: if HOAFlow is involved in a merger, acquisition, or asset sale, information may be transferred as part of that transaction, subject to this policy.",
        "We do not sell personal information."
      ]
    },
    {
      id: "data-retention",
      title: "Data retention",
      paragraphs: [
        "We retain account and workspace data for as long as your organization maintains an active account or as needed to provide the Services.",
        "After account termination, we may retain certain information for backup, audit, dispute resolution, and legal compliance for a limited period, then delete or de-identify it unless a longer retention period is required by law.",
        "Your organization may export data before closure where export features are available."
      ]
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We implement administrative, technical, and organizational measures designed to protect information, including encryption in transit, access controls, and audit logging. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
        "You are responsible for maintaining the confidentiality of your credentials and for configuring appropriate access within your organization."
      ]
    },
    {
      id: "your-rights",
      title: "Your rights and choices",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal information, or to object to certain processing.",
        "Residents and community members whose data is managed by an HOA should contact their association or property manager to exercise rights related to data held in a customer workspace. HOAFlow processes that data on behalf of the customer organization.",
        "To submit a privacy request related to your HOAFlow account, contact us at privacy@hoaflow.com. We may need to verify your identity before responding."
      ]
    },
    {
      id: "international",
      title: "International transfers",
      paragraphs: [
        "HOAFlow is operated from the United States. If you access the Services from outside the United States, your information may be transferred to, stored in, and processed in the United States or other countries where we or our service providers operate."
      ]
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "The Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have collected such information, contact us and we will take appropriate steps to delete it."
      ]
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the \"Last updated\" date. Material changes may be communicated by email or in-product notice where appropriate.",
        "Continued use of the Services after an update constitutes acceptance of the revised policy."
      ]
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        "Questions about this Privacy Policy or our data practices may be sent to privacy@hoaflow.com or hello@hoaflow.com.",
        "HOAFlow, Inc."
      ]
    }
  ]
};

export const TERMS_OF_SERVICE: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  description: "The terms that govern access to and use of HOAFlow.",
  lastUpdated: "May 30, 2026",
  sections: [
    {
      id: "agreement",
      title: "Agreement to terms",
      paragraphs: [
        "These Terms of Service (\"Terms\") are a binding agreement between you and HOAFlow, Inc. (\"HOAFlow,\" \"we,\" \"us,\" or \"our\") governing your access to and use of the HOAFlow website, applications, and related services (collectively, the \"Services\").",
        "If you use the Services on behalf of an organization, you represent that you have authority to bind that organization, and \"you\" refers to both you and the organization.",
        "By creating an account, accepting an invitation, or using the Services, you agree to these Terms and our Privacy Policy."
      ]
    },
    {
      id: "services",
      title: "The Services",
      paragraphs: [
        "HOAFlow provides software for HOA and community association operations, including violation management, resident and property records, inspections, documents, reporting, and related workflows.",
        "We may modify, suspend, or discontinue features at any time. We will use reasonable efforts to avoid materially reducing core functionality for paid customers during an active subscription term without notice.",
        "Demo, preview, or trial environments may contain sample data and are provided without warranty."
      ]
    },
    {
      id: "accounts",
      title: "Accounts and access",
      paragraphs: [
        "You must provide accurate registration information and keep your account credentials secure. You are responsible for activity under your account.",
        "Organizations control user invitations, roles, and permissions within their workspace. You agree to use the Services only for lawful HOA and property management purposes.",
        "We may suspend or terminate access if we reasonably believe your account has been compromised, is being misused, or violates these Terms."
      ]
    },
    {
      id: "customer-data",
      title: "Customer data",
      paragraphs: [
        "\"Customer Data\" means information submitted to the Services by you or your users, including resident, property, violation, financial, and document records.",
        "You retain ownership of Customer Data. You grant HOAFlow a limited license to host, process, transmit, and display Customer Data solely to provide and improve the Services, comply with law, and as described in our Privacy Policy.",
        "You are responsible for obtaining any notices or consents required to collect and process Customer Data, including data about residents and homeowners."
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "You may not use the Services to violate law, infringe intellectual property, harass others, upload malware, attempt unauthorized access, scrape or reverse engineer the platform except as permitted by law, or resell the Services without authorization.",
        "You may not use the Services to store or transmit content that is unlawful, defamatory, or violates the privacy or rights of others.",
        "We may investigate violations and cooperate with law enforcement where required."
      ]
    },
    {
      id: "fees",
      title: "Fees and payment",
      paragraphs: [
        "Paid plans, if offered, are billed according to the pricing and billing terms presented at purchase or in an order form. Fees are non-refundable except where required by law or expressly stated in writing.",
        "Failure to pay applicable fees may result in suspension or downgrade of the Services.",
        "We may change pricing for renewals with reasonable advance notice."
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "HOAFlow and its licensors own the Services, software, branding, and documentation, excluding Customer Data. These Terms do not grant you any ownership rights in the Services.",
        "You may provide feedback about the Services. We may use feedback without restriction or compensation to you."
      ]
    },
    {
      id: "confidentiality",
      title: "Confidentiality",
      paragraphs: [
        "Each party may receive confidential information from the other. The receiving party will use reasonable care to protect confidential information and use it only for purposes related to the Services.",
        "This obligation does not apply to information that is public, independently developed, or lawfully received from a third party without restriction."
      ]
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "THE SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE.\" TO THE MAXIMUM EXTENT PERMITTED BY LAW, HOAFLOW DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        "HOAFLOW DOES NOT PROVIDE LEGAL, TAX, OR COMPLIANCE ADVICE. YOU ARE RESPONSIBLE FOR ENSURING YOUR USE OF THE SERVICES COMPLIES WITH APPLICABLE HOA GOVERNING DOCUMENTS, STATE LAWS, AND REGULATIONS."
      ]
    },
    {
      id: "limitation",
      title: "Limitation of liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, HOAFLOW WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO THE SERVICES.",
        "HOAFLOW'S TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS WILL NOT EXCEED THE AMOUNT PAID BY YOU TO HOAFLOW FOR THE SERVICES IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED U.S. DOLLARS ($100) IF NO FEES WERE PAID."
      ]
    },
    {
      id: "indemnity",
      title: "Indemnification",
      paragraphs: [
        "You will defend, indemnify, and hold harmless HOAFlow and its officers, directors, employees, and agents from claims, damages, and expenses (including reasonable attorneys' fees) arising from Customer Data, your use of the Services, or your violation of these Terms or applicable law."
      ]
    },
    {
      id: "termination",
      title: "Termination",
      paragraphs: [
        "You may stop using the Services at any time. We may suspend or terminate your access if you materially breach these Terms or if required for legal or security reasons.",
        "Upon termination, your right to access the Services ends. Provisions that by their nature should survive termination will survive, including ownership, disclaimers, limitation of liability, and indemnification."
      ]
    },
    {
      id: "governing-law",
      title: "Governing law and disputes",
      paragraphs: [
        "These Terms are governed by the laws of the State of Delaware, excluding conflict-of-law rules.",
        "Except where prohibited, disputes will be resolved in the state or federal courts located in Delaware, and you consent to personal jurisdiction in those courts.",
        "Either party may seek injunctive relief in any court of competent jurisdiction for misuse of intellectual property or confidential information."
      ]
    },
    {
      id: "general",
      title: "General",
      paragraphs: [
        "These Terms, together with the Privacy Policy and any order form or plan-specific terms, constitute the entire agreement between you and HOAFlow regarding the Services.",
        "If any provision is unenforceable, the remaining provisions remain in effect. Our failure to enforce a provision is not a waiver.",
        "You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.",
        "We may update these Terms by posting a revised version on this page. Material changes will be communicated where appropriate. Continued use after the effective date constitutes acceptance."
      ]
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about these Terms may be sent to legal@hoaflow.com or hello@hoaflow.com.",
        "HOAFlow, Inc."
      ]
    }
  ]
};

export function getLegalDocument(slug: "privacy" | "terms"): LegalDocument {
  return slug === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE;
}
