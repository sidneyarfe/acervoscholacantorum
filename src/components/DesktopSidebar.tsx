import { cn } from "@/lib/utils";
import { Home, Library, Search, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import scholaLogo from "@/assets/schola-logo.png";

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "library", label: "Repertório", icon: Library },
  { id: "search", label: "Buscar", icon: Search },
  { id: "calendar", label: "Celebrações", icon: Calendar },
  { id: "profile", label: "Perfil", icon: User },
];

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border",
        collapsed && "justify-center"
      )}>
        <img 
          src={scholaLogo} 
          alt="Schola Cantorum" 
          className={cn(
            "object-contain flex-shrink-0",
            collapsed ? "w-12 h-12" : "w-14 h-14"
          )}
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <h1 className="font-display text-lg font-semibold leading-tight text-foreground truncate">
              Schola Cantorum
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              Catedral de Belém
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                collapsed && "justify-center px-3",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-gold")} />
              {!collapsed && (
                <span className={cn("font-medium", isActive && "text-gold")}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed && "px-0")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
