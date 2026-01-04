
import { 
  LayoutDashboard, 
  Database, 
  Activity, 
  Search, 
  FileText, 
  Settings, 
  AlertTriangle,
  Building2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS } from "./NavigationData";
import { List } from "lucide-react";

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed?: boolean;
}

export function AdminSidebar({ activeView, setActiveView, isCollapsed = false }: AdminSidebarProps) {
  return (
    <div className={`flex flex-col h-screen bg-slate-950 text-slate-100 border-r border-slate-800 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        {isCollapsed ? (
            <div className="font-bold text-xl">JF</div>
        ) : (
            <div className="font-bold text-xl">JobFinder Admin</div>
        )}
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
           <Button
              variant={activeView === "navigation" ? "secondary" : "ghost"}
              className={`w-full justify-start mb-4 ${activeView === "navigation" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-indigo-400 hover:text-indigo-300 hover:bg-slate-900"} ${isCollapsed ? "px-2 justify-center" : "px-4"}`}
              onClick={() => setActiveView("navigation")}
            >
              <List className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && <span className="font-bold">Platform Sitemap</span>}
            </Button>

          {ADMIN_NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start ${activeView === item.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"} ${isCollapsed ? "px-2 justify-center" : "px-4"}`}
              onClick={() => setActiveView(item.id)}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        {!isCollapsed && (
            <div className="text-xs text-slate-500 text-center">
                v2.0.0 Admin Portal
            </div>
        )}
      </div>
    </div>
  );
}
