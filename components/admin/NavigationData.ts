import {
    LayoutDashboard,
    Globe,
    BarChart3,
    Database,
    BrainCircuit,
    Settings,
    Bell,
    CheckSquare,
    FileText
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
    {
        id: "overview",
        label: "Executive Overview",
        icon: LayoutDashboard,
        description: "High-level platform health and growth metrics."
    },
    {
        id: "predictive",
        label: "Predictive Insights",
        icon: BrainCircuit,
        description: "AI-driven market forecasting and indices."
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
