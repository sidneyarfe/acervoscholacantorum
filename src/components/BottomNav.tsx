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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around px-1 py-1.5 pb-[env(safe-area-inset-bottom,8px)]">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-lg transition-colors flex-1 max-w-[72px]",
                isActive
                  ? "text-gold"
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive && "text-gold"
                )}
              />
              <span className={cn(
                "text-[10px] font-medium leading-tight truncate",
                isActive && "font-semibold text-gold"
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
