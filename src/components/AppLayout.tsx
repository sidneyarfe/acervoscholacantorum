import { ReactNode } from "react";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { BottomNav } from "@/components/BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

export function AppLayout({ children, activeTab, onTabChange, isAdmin }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} isAdmin={isAdmin} />
      <main className="flex-1 min-h-screen lg:pb-0 pb-16">
        {children}
      </main>
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
