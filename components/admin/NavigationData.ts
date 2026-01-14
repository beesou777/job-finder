import {
    LayoutDashboard,
    Globe,
    BarChart3,
    Database,
    BrainCircuit,
    Settings,
    Bell,
    CheckSquare,
    FileText,
    Building2,
    Target
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
    {
        id: "overview",
        label: "Executive Overview",
        icon: LayoutDashboard,
        description: "High-level platform health and growth metrics."
    },
    {
        id: "companies",
        label: "Company Enrichment",
        icon: Building2,
        description: "Hiring intent intelligence and sales outreach."
    },
    {
        id: "opportunities",
        label: "Client Opportunities",
        icon: Target,
        description: "LinkedIn companies not on our platform - sales leads."
    },
    {
        id: "sources",
        label: "Source Intelligence",
        icon: Database,
        description: "Data pipeline monitoring and source reliability."
    },
    {
        id: "seo",
        label: "SEO & Content",
        icon: Globe,
        description: "Visibility triggers and keyword performance."
    },
    {
        id: "reports",
        label: "Report Builder",
        icon: FileText,
        description: "Custom exports and trend analysis tables."
    },
    {
        id: "data-quality",
        label: "Data Quality",
        icon: CheckSquare,
        description: "Field completion and normalization audits."
    },
    {
        id: "alerts",
        label: "System Alerts",
        icon: Bell,
        description: "Operational warnings and failure logs."
    },
    {
        id: "settings",
        label: "Platform Settings",
        icon: Settings,
        description: "Scraper controls and platform configuration."
    }
];
