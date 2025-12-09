import { Search, Home, Library, Calendar, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "library", label: "Repertório", icon: Library },
  { id: "calendar", label: "Celebrações", icon: Calendar },
  { id: "profile", label: "Perfil", icon: User },
];

export function BottomNav({ activeTab, onTabChange, isAdmin }: BottomNavProps) {
  const allNavItems = isAdmin 
    ? [...navItems, { id: "admin", label: "Admin", icon: Shield }]
    : navItems;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-gold bg-gold/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
